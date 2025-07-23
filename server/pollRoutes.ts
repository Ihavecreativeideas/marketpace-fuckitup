import express, { Request, Response } from 'express';
import { db } from './db';
import { posts, pollVotes, users } from '../shared/schema';
import { eq, desc, count, sql, and } from 'drizzle-orm';

const router = express.Router();

// Create a new poll
router.post('/polls', async (req, res) => {
  try {
    const { title, description, options, category, allowMultiple, endDate } = req.body;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!title || !options || options.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Poll must have a title and at least 2 options' 
      });
    }

    // Create poll
    const [newPoll] = await db
      .insert(polls)
      .values({
        userId,
        title,
        description: description || '',
        category: category || 'general',
        allowMultiple: allowMultiple || false,
        endDate: endDate ? new Date(endDate) : null,
        totalVotes: 0,
        isActive: true,
        createdAt: new Date()
      })
      .returning();

    // Create poll options
    const pollOptionPromises = options.map((option: string, index: number) => 
      db.insert(pollOptions).values({
        pollId: newPoll.id,
        optionText: option,
        voteCount: 0,
        optionOrder: index
      }).returning()
    );

    const createdOptions = await Promise.all(pollOptionPromises);

    res.json({ 
      success: true, 
      poll: {
        ...newPoll,
        options: createdOptions.map(opt => opt[0])
      }
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ success: false, message: 'Failed to create poll' });
  }
});

// Get polls with pagination
router.get('/polls', async (req, res) => {
  try {
    const { page = '1', limit = '10', category, userId: filterUserId } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereConditions = sql`${polls.isActive} = true`;
    
    if (category && category !== 'all') {
      whereConditions = and(whereConditions, eq(polls.category, category as string));
    }
    
    if (filterUserId) {
      whereConditions = and(whereConditions, eq(polls.userId, filterUserId as string));
    }

    // Get polls with user info
    const pollsData = await db
      .select({
        pollId: polls.id,
        title: polls.title,
        description: polls.description,
        category: polls.category,
        allowMultiple: polls.allowMultiple,
        endDate: polls.endDate,
        totalVotes: polls.totalVotes,
        isActive: polls.isActive,
        createdAt: polls.createdAt,
        creatorName: users.firstName,
        creatorLastName: users.lastName
      })
      .from(polls)
      .leftJoin(users, eq(polls.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(polls.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get options for each poll
    const pollsWithOptions = await Promise.all(
      pollsData.map(async (poll) => {
        const options = await db
          .select()
          .from(pollOptions)
          .where(eq(pollOptions.pollId, poll.pollId))
          .orderBy(pollOptions.optionOrder);

        return {
          ...poll,
          options
        };
      })
    );

    res.json({ success: true, polls: pollsWithOptions });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch polls' });
  }
});

// Get single poll with detailed results
router.get('/polls/:id', async (req, res) => {
  try {
    const pollId = req.params.id;

    // Get poll details
    const [poll] = await db
      .select({
        pollId: polls.id,
        title: polls.title,
        description: polls.description,
        category: polls.category,
        allowMultiple: polls.allowMultiple,
        endDate: polls.endDate,
        totalVotes: polls.totalVotes,
        isActive: polls.isActive,
        createdAt: polls.createdAt,
        creatorName: users.firstName,
        creatorLastName: users.lastName,
        creatorId: users.id
      })
      .from(polls)
      .leftJoin(users, eq(polls.userId, users.id))
      .where(eq(polls.id, pollId))
      .limit(1);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Get poll options with vote counts
    const options = await db
      .select({
        id: pollOptions.id,
        optionText: pollOptions.optionText,
        voteCount: pollOptions.voteCount,
        optionOrder: pollOptions.optionOrder,
        percentage: sql<number>`CASE 
          WHEN ${polls.totalVotes} > 0 
          THEN ROUND((${pollOptions.voteCount}::float / ${polls.totalVotes}::float) * 100, 1)
          ELSE 0 
        END`
      })
      .from(pollOptions)
      .leftJoin(polls, eq(pollOptions.pollId, polls.id))
      .where(eq(pollOptions.pollId, pollId))
      .orderBy(pollOptions.optionOrder);

    // Check if current user has voted
    let userVotes = [];
    if (req.user?.claims?.sub) {
      userVotes = await db
        .select({ optionId: pollVotes.optionId })
        .from(pollVotes)
        .where(and(
          eq(pollVotes.pollId, pollId),
          eq(pollVotes.userId, req.user.claims.sub)
        ));
    }

    res.json({ 
      success: true, 
      poll: {
        ...poll,
        options,
        userVotes: userVotes.map(vote => vote.optionId)
      }
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch poll' });
  }
});

// Vote on a poll
router.post('/polls/:id/vote', async (req, res) => {
  try {
    const pollId = req.params.id;
    const { optionIds } = req.body;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Must select at least one option' });
    }

    // Get poll details
    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ success: false, message: 'Poll is no longer active' });
    }

    if (poll.endDate && new Date() > poll.endDate) {
      return res.status(400).json({ success: false, message: 'Poll has ended' });
    }

    // Check if user has already voted
    const existingVotes = await db
      .select()
      .from(pollVotes)
      .where(and(
        eq(pollVotes.pollId, pollId),
        eq(pollVotes.userId, userId)
      ));

    if (existingVotes.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already voted on this poll' });
    }

    // Validate option IDs belong to this poll
    const validOptions = await db
      .select({ id: pollOptions.id })
      .from(pollOptions)
      .where(eq(pollOptions.pollId, pollId));

    const validOptionIds = validOptions.map(opt => opt.id);
    const invalidOptions = optionIds.filter(id => !validOptionIds.includes(id));

    if (invalidOptions.length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid option selected' });
    }

    // Check if multiple votes are allowed
    if (!poll.allowMultiple && optionIds.length > 1) {
      return res.status(400).json({ success: false, message: 'Only one option allowed for this poll' });
    }

    // Start transaction to record votes
    await db.transaction(async (tx) => {
      // Record votes
      const votePromises = optionIds.map(optionId =>
        tx.insert(pollVotes).values({
          pollId,
          optionId,
          userId,
          createdAt: new Date()
        })
      );

      await Promise.all(votePromises);

      // Update option vote counts
      const updatePromises = optionIds.map(optionId =>
        tx.update(pollOptions)
          .set({ voteCount: sql`${pollOptions.voteCount} + 1` })
          .where(eq(pollOptions.id, optionId))
      );

      await Promise.all(updatePromises);

      // Update total poll votes
      await tx.update(polls)
        .set({ totalVotes: sql`${polls.totalVotes} + ${optionIds.length}` })
        .where(eq(polls.id, pollId));
    });

    // Get updated poll results
    const updatedOptions = await db
      .select({
        id: pollOptions.id,
        optionText: pollOptions.optionText,
        voteCount: pollOptions.voteCount,
        optionOrder: pollOptions.optionOrder
      })
      .from(pollOptions)
      .where(eq(pollOptions.pollId, pollId))
      .orderBy(pollOptions.optionOrder);

    const [updatedPoll] = await db
      .select({ totalVotes: polls.totalVotes })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1);

    // Calculate percentages
    const optionsWithPercentages = updatedOptions.map(option => ({
      ...option,
      percentage: updatedPoll.totalVotes > 0 
        ? Math.round((option.voteCount / updatedPoll.totalVotes) * 100 * 10) / 10
        : 0
    }));

    res.json({ 
      success: true, 
      message: 'Vote recorded successfully',
      results: {
        totalVotes: updatedPoll.totalVotes,
        options: optionsWithPercentages
      }
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ success: false, message: 'Failed to record vote' });
  }
});

// Get poll results (public endpoint)
router.get('/polls/:id/results', async (req, res) => {
  try {
    const pollId = req.params.id;

    // Get poll with results
    const [poll] = await db
      .select({
        id: polls.id,
        title: polls.title,
        totalVotes: polls.totalVotes,
        isActive: polls.isActive,
        endDate: polls.endDate
      })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    const options = await db
      .select({
        id: pollOptions.id,
        optionText: pollOptions.optionText,
        voteCount: pollOptions.voteCount,
        optionOrder: pollOptions.optionOrder,
        percentage: sql<number>`CASE 
          WHEN ${poll.totalVotes} > 0 
          THEN ROUND((${pollOptions.voteCount}::float / ${poll.totalVotes}::float) * 100, 1)
          ELSE 0 
        END`
      })
      .from(pollOptions)
      .where(eq(pollOptions.pollId, pollId))
      .orderBy(pollOptions.optionOrder);

    res.json({ 
      success: true, 
      poll: {
        ...poll,
        options
      }
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch poll results' });
  }
});

// Delete poll (only by creator)
router.delete('/polls/:id', async (req, res) => {
  try {
    const pollId = req.params.id;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if user owns the poll
    const [poll] = await db
      .select({ userId: polls.userId })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (poll.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this poll' });
    }

    // Soft delete - just mark as inactive
    await db
      .update(polls)
      .set({ isActive: false })
      .where(eq(polls.id, pollId));

    res.json({ success: true, message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ success: false, message: 'Failed to delete poll' });
  }
});

// Get poll categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'general', name: 'General', icon: '💬' },
      { id: 'community', name: 'Community', icon: '🏘️' },
      { id: 'events', name: 'Events', icon: '📅' },
      { id: 'local', name: 'Local Issues', icon: '🏛️' },
      { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
      { id: 'food', name: 'Food & Dining', icon: '🍕' },
      { id: 'sports', name: 'Sports', icon: '⚽' },
      { id: 'business', name: 'Business', icon: '💼' },
      { id: 'education', name: 'Education', icon: '📚' },
      { id: 'health', name: 'Health & Wellness', icon: '🏥' }
    ];

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

export default router;