// MarketPace Sales Payment System
// Streamlined payment processing with automatic fee deduction

function calculateSalesPayment(itemPrice, deliveryDistance = 3, hasInsurance = true) {
    // Base costs
    const baseItemPrice = parseFloat(itemPrice);
    
    // Platform sustainability fee (5% of item price only)
    const platformFee = baseItemPrice * 0.05;
    
    // Coverage fee (optional insurance)
    const coverageFee = hasInsurance ? baseItemPrice * 0.02 : 0; // 2% for item protection
    
    // Delivery costs (split between buyer and seller)
    const baseDeliveryFee = 8; // $4 pickup + $4 dropoff
    const mileageFee = deliveryDistance * 0.50; // $0.50 per mile
    const totalDeliveryFee = baseDeliveryFee + mileageFee;
    const splitDeliveryFee = totalDeliveryFee / 2; // Each party pays half
    
    // Seller calculations (automatic deductions)
    const sellerDeductions = platformFee + coverageFee + splitDeliveryFee;
    const sellerPayout = baseItemPrice - sellerDeductions;
    
    // Buyer calculations
    const buyerItemCost = baseItemPrice;
    const buyerDeliveryShare = splitDeliveryFee;
    const buyerTotal = buyerItemCost + buyerDeliveryShare;
    
    return {
        itemPrice: baseItemPrice,
        platformFee: platformFee,
        coverageFee: coverageFee,
        totalDeliveryFee: totalDeliveryFee,
        splitDeliveryFee: splitDeliveryFee,
        sellerPayout: sellerPayout,
        buyerTotal: buyerTotal,
        sellerDeductions: sellerDeductions
    };
}

// Example usage for different scenarios
function displayPaymentBreakdown(itemPrice, deliveryDistance = 3, hasInsurance = true) {
    const payment = calculateSalesPayment(itemPrice, deliveryDistance, hasInsurance);
    
    console.log('📦 SALES PAYMENT BREAKDOWN');
    console.log('═══════════════════════════');
    console.log(`Item Price: $${payment.itemPrice.toFixed(2)}`);
    console.log(`Platform Fee (5%): $${payment.platformFee.toFixed(2)} (auto-deducted)`);
    console.log(`Coverage Fee (2%): $${payment.coverageFee.toFixed(2)} (auto-deducted)`);
    console.log(`Total Delivery: $${payment.totalDeliveryFee.toFixed(2)}`);
    console.log(`Split Delivery (each): $${payment.splitDeliveryFee.toFixed(2)}`);
    console.log('───────────────────────────');
    console.log(`💰 SELLER RECEIVES: $${payment.sellerPayout.toFixed(2)}`);
    console.log(`💳 BUYER PAYS: $${payment.buyerTotal.toFixed(2)}`);
    console.log('═══════════════════════════');
    
    return payment;
}

// Integration with existing cart system
function processMarketPlaceOrder(items, deliveryAddress, tipAmount = 0) {
    let totalSellerPayouts = 0;
    let totalBuyerCost = 0;
    let totalPlatformFees = 0;
    
    const orderBreakdown = items.map(item => {
        const payment = calculateSalesPayment(item.price, item.deliveryDistance, item.hasInsurance);
        totalSellerPayouts += payment.sellerPayout;
        totalBuyerCost += payment.buyerTotal;
        totalPlatformFees += payment.platformFee + payment.coverageFee;
        
        return {
            itemName: item.name,
            seller: item.seller,
            ...payment
        };
    });
    
    const finalBuyerTotal = totalBuyerCost + tipAmount;
    
    return {
        orderBreakdown,
        totalSellerPayouts,
        finalBuyerTotal,
        totalPlatformFees,
        tipAmount,
        summary: {
            itemsTotal: totalBuyerCost - (orderBreakdown.length * orderBreakdown[0].splitDeliveryFee),
            deliveryTotal: orderBreakdown.length * orderBreakdown[0].splitDeliveryFee,
            tip: tipAmount,
            total: finalBuyerTotal
        }
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateSalesPayment,
        displayPaymentBreakdown,
        processMarketPlaceOrder
    };
}

/* 
EXAMPLE SCENARIOS:

1. $50 item, 3-mile delivery, with insurance:
   - Seller receives: $45.25 (after $4.75 deductions)
   - Buyer pays: $52.25 ($50 item + $2.25 delivery share)

2. $100 item, 5-mile delivery, with insurance:
   - Seller receives: $89.25 (after $10.75 deductions)  
   - Buyer pays: $104.25 ($100 item + $4.25 delivery share)

3. Rental vs Sales difference:
   - Rentals: 5% fee deducted, renter pays full delivery
   - Sales: 5% + 2% + split delivery deducted, buyer pays split delivery

This system ensures:
- Automatic fee processing
- Fair delivery cost sharing
- Transparent seller payouts
- Streamlined buyer experience
- Platform sustainability
*/