import { db } from './db';
import { discountCodes, discountCodeUsage, type InsertDiscountCode, type DiscountCode, type InsertDiscountCodeUsage } from '../shared/schema';
import { eq, and, gte, lte, isNull, or } from 'drizzle-orm';

interface DiscountValidationResult {
  isValid: boolean;
  discount: DiscountCode | null;
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
}

interface ApplyDiscountParams {
  code: string;
  userId: string;
  originalAmount: number; // in cents
  categories?: string[];
  businessType?: string;
}

class DiscountCodeService {
  // Create a new discount code (admin or Pro member)
  async createDiscountCode(discountData: InsertDiscountCode): Promise<DiscountCode> {
    try {
      const [discount] = await db.insert(discountCodes).values({
        ...discountData,
        code: discountData.code.toUpperCase(), // Always store codes in uppercase
        scope: discountData.scope || 'business', // default to business scope
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return discount;
    } catch (error) {
      if (error.constraint === 'discount_codes_code_unique') {
        throw new Error('Discount code already exists');
      }
      throw error;
    }
  }

  // Create a business-specific discount code for Pro members
  async createBusinessDiscountCode(data: {
    code: string;
    name: string;
    description?: string;
    type: string;
    value: number;
    minimumPurchase?: number;
    maximumDiscount?: number;
    usageLimit?: number;
    validFrom?: Date;
    validUntil?: Date;
    businessId: string;
    createdBy: string;
    specificProducts?: string[];
  }): Promise<DiscountCode> {
    const discountData = {
      ...data,
      scope: 'business',
      applicableCategories: null,
      applicableBusinessTypes: null,
      excludeCategories: null,
    };

    return this.createDiscountCode(discountData);
  }

  // Get all discount codes with usage statistics
  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    const codes = await db.select().from(discountCodes).orderBy(discountCodes.createdAt);
    return codes;
  }

  // Get discount codes by business ID (for Pro members)
  async getDiscountCodesByBusiness(businessId: string): Promise<DiscountCode[]> {
    const codes = await db.select().from(discountCodes)
      .where(eq(discountCodes.businessId, businessId))
      .orderBy(discountCodes.createdAt);
    return codes;
  }

  // Get discount code by ID
  async getDiscountCodeById(id: string): Promise<DiscountCode | null> {
    const [discount] = await db.select().from(discountCodes).where(eq(discountCodes.id, id));
    return discount || null;
  }

  // Get discount code by code string
  async getDiscountCodeByCode(code: string): Promise<DiscountCode | null> {
    const [discount] = await db.select().from(discountCodes).where(eq(discountCodes.code, code.toUpperCase()));
    return discount || null;
  }

  // Update discount code
  async updateDiscountCode(id: string, updates: Partial<InsertDiscountCode>): Promise<DiscountCode> {
    const [updated] = await db.update(discountCodes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(discountCodes.id, id))
      .returning();
    
    if (!updated) {
      throw new Error('Discount code not found');
    }
    
    return updated;
  }

  // Delete discount code
  async deleteDiscountCode(id: string): Promise<boolean> {
    const result = await db.delete(discountCodes).where(eq(discountCodes.id, id));
    return result.rowCount > 0;
  }

  // Validate and apply discount code
  async validateAndApplyDiscount(params: ApplyDiscountParams): Promise<DiscountValidationResult> {
    const { code, userId, originalAmount, categories = [], businessType } = params;
    
    // Get the discount code
    const discount = await this.getDiscountCodeByCode(code);
    if (!discount) {
      return { isValid: false, discount: null, error: 'Invalid discount code' };
    }

    // Check if code is active
    if (!discount.isActive) {
      return { isValid: false, discount: null, error: 'Discount code is no longer active' };
    }

    // Check validity dates
    const now = new Date();
    if (discount.validFrom && new Date(discount.validFrom) > now) {
      return { isValid: false, discount: null, error: 'Discount code is not yet valid' };
    }
    if (discount.validUntil && new Date(discount.validUntil) < now) {
      return { isValid: false, discount: null, error: 'Discount code has expired' };
    }

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return { isValid: false, discount: null, error: 'Discount code has reached its usage limit' };
    }

    // Check minimum purchase requirement
    if (discount.minimumPurchase && originalAmount < discount.minimumPurchase) {
      const minAmount = (discount.minimumPurchase / 100).toFixed(2);
      return { 
        isValid: false, 
        discount: null, 
        error: `Minimum purchase of $${minAmount} required for this discount code` 
      };
    }

    // Check category restrictions
    if (discount.applicableCategories) {
      const applicableCategories = discount.applicableCategories as string[];
      if (applicableCategories.length > 0 && !categories.some(cat => applicableCategories.includes(cat))) {
        return { isValid: false, discount: null, error: 'Discount code is not applicable to items in your cart' };
      }
    }

    // Check excluded categories
    if (discount.excludeCategories) {
      const excludedCategories = discount.excludeCategories as string[];
      if (excludedCategories.length > 0 && categories.some(cat => excludedCategories.includes(cat))) {
        return { isValid: false, discount: null, error: 'Some items in your cart are excluded from this discount' };
      }
    }

    // Check business type restrictions
    if (discount.applicableBusinessTypes) {
      const applicableTypes = discount.applicableBusinessTypes as string[];
      if (applicableTypes.length > 0 && businessType && !applicableTypes.includes(businessType)) {
        return { isValid: false, discount: null, error: 'Discount code is not applicable to this business type' };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = Math.round((originalAmount * discount.value) / 100);
      // Apply maximum discount limit if set
      if (discount.maximumDiscount && discountAmount > discount.maximumDiscount) {
        discountAmount = discount.maximumDiscount;
      }
    } else if (discount.type === 'fixed_amount') {
      discountAmount = discount.value;
      // Don't let discount exceed the original amount
      if (discountAmount > originalAmount) {
        discountAmount = originalAmount;
      }
    } else if (discount.type === 'free_shipping') {
      // For free shipping, we'll assume a standard shipping cost
      // This would need to be integrated with actual shipping calculations
      discountAmount = 0; // This should be calculated based on actual shipping cost
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      isValid: true,
      discount,
      discountAmount,
      finalAmount
    };
  }

  // Record discount code usage
  async recordDiscountUsage(params: {
    codeId: string;
    userId: string;
    orderId: string;
    discountAmount: number;
    originalAmount: number;
    finalAmount: number;
  }): Promise<void> {
    const { codeId, userId, orderId, discountAmount, originalAmount, finalAmount } = params;

    // Record the usage
    await db.insert(discountCodeUsage).values({
      codeId,
      userId,
      orderId,
      discountAmount,
      originalAmount,
      finalAmount,
      usedAt: new Date()
    });

    // Increment usage count
    await db.update(discountCodes)
      .set({ 
        usedCount: db.sql`${discountCodes.usedCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(discountCodes.id, codeId));
  }

  // Get discount code usage statistics
  async getDiscountCodeStats(codeId: string) {
    const [code] = await db.select().from(discountCodes).where(eq(discountCodes.id, codeId));
    if (!code) {
      throw new Error('Discount code not found');
    }

    const usage = await db.select().from(discountCodeUsage)
      .where(eq(discountCodeUsage.codeId, codeId))
      .orderBy(discountCodeUsage.usedAt);

    const totalDiscountGiven = usage.reduce((sum, u) => sum + u.discountAmount, 0);
    const totalOriginalAmount = usage.reduce((sum, u) => sum + u.originalAmount, 0);
    const averageDiscountPercentage = totalOriginalAmount > 0 ? (totalDiscountGiven / totalOriginalAmount) * 100 : 0;

    return {
      code,
      usage,
      stats: {
        totalUses: usage.length,
        totalDiscountGiven: totalDiscountGiven / 100, // Convert to dollars
        totalOriginalAmount: totalOriginalAmount / 100, // Convert to dollars
        averageDiscountPercentage: Math.round(averageDiscountPercentage * 100) / 100,
        remainingUses: code.usageLimit ? Math.max(0, code.usageLimit - code.usedCount) : null
      }
    };
  }

  // Generate a random discount code
  generateRandomCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Deactivate expired codes
  async deactivateExpiredCodes(): Promise<number> {
    const now = new Date();
    const result = await db.update(discountCodes)
      .set({ isActive: false, updatedAt: now })
      .where(and(
        eq(discountCodes.isActive, true),
        lte(discountCodes.validUntil, now)
      ));
    
    return result.rowCount;
  }
}

export const discountCodeService = new DiscountCodeService();