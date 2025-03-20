import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Transaction, { ITransaction } from '../models/transaction.model';
import User, { IUser } from '../models/user.model';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB using the environment variable
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_database';
console.log('Using MongoDB URI:', MONGODB_URI);
mongoose.connect(MONGODB_URI);

// Define the transaction types and their respective validation rules
const transactionRules = {
  'online-booking': {
    validPaymentTypes: ['XP'],
    validRoles: ['user'],
  },
  'walk-in-booking': {
    validPaymentTypes: ['cash'],
    validRoles: ['owner', 'manager'],
  },
  'membership': {
    validPaymentTypes: ['cash', 'card'],
    cashOnlyRoles: ['owner', 'manager'],
  },
};

/**
 * Generate a random amount between min and max
 */
function generateRandomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate a random date within the past year
 */
function generateDateInPastYear(): Date {
  // Generate a date between now and 1 year ago
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  return faker.date.between({ from: oneYearAgo, to: now });
}

/**
 * Create fake transactions for the past year
 */
async function generateFakeTransactions() {
  try {
    console.log('Connecting to database...');
    
    // Fetch existing users grouped by role
    const users = await User.find();
    
    if (users.length === 0) {
      console.error('No users found in the database. Please create users first.');
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    // Group users by role for easier access
    const usersByRole: Record<string, IUser[]> = {
      user: users.filter(user => user.role === 'user'),
      manager: users.filter(user => user.role === 'manager'),
      owner: users.filter(user => user.role === 'owner'),
    };
    
    console.log(`Users by role: user=${usersByRole.user.length}, manager=${usersByRole.manager.length}, owner=${usersByRole.owner.length}`);
    
    // Make sure we have users of each role type
    if (usersByRole.user.length === 0) {
      console.warn('No users with role "user" found. Some transaction types cannot be created.');
    }
    if (usersByRole.manager.length === 0 && usersByRole.owner.length === 0) {
      console.warn('No users with role "manager" or "owner" found. Some transaction types cannot be created.');
    }
    
    const transactions: Array<mongoose.Document> = [];
    const transactionCount = 200; // Number of transactions to generate
    
    // Generate transactions for the past year
    for (let i = 0; i < transactionCount; i++) {
      // Randomly select a transaction type
      const transactionType = faker.helpers.arrayElement([
        'online-booking', 'walk-in-booking', 'membership'
      ] as Array<'online-booking' | 'walk-in-booking' | 'membership'>);
      
      // Get the validation rules for this transaction type
      const rules = transactionRules[transactionType];
      
      // Get users with valid roles for this transaction type
      let validUsers: IUser[] = [];
      if (transactionType === 'online-booking') {
        validUsers = usersByRole.user;
      } else if (transactionType === 'walk-in-booking') {
        validUsers = [...usersByRole.manager, ...usersByRole.owner];
      } else if (transactionType === 'membership') {
        // All users can do membership with card, but only manager/owner with cash
        validUsers = users;
      }
      
      // Skip if no valid users found
      if (validUsers.length === 0) {
        continue;
      }
      
      // Randomly select a user
      const user = faker.helpers.arrayElement(validUsers);
      
      // Determine valid payment types based on transaction type and user role
      let validPaymentTypes = rules.validPaymentTypes;
      
      // Special case for membership: cash is only for manager/owner
      if (transactionType === 'membership' && user.role === 'user') {
        validPaymentTypes = ['card']; // User role can only use card for membership
      }
      
      // Randomly select a payment type
      const paymentType = faker.helpers.arrayElement(
        validPaymentTypes
      ) as 'cash' | 'card' | 'XP';
      
      // Generate transaction data
      const amount = generateRandomAmount(10, 500);
      
      // For XP payments, ensure the user has enough XP balance
      if (paymentType === 'XP' && user.xp < amount) {
        continue;
      }
      
      // Create a new transaction
      const transaction = new Transaction({
        userID: user._id,
        paymentType,
        amount,
        transactionType,
        status: faker.helpers.arrayElement(['completed', 'failed']),
        createdAt: generateDateInPastYear(),
      });
      
      transactions.push(transaction);
    }
    
    // Save transactions to the database
    if (transactions.length > 0) {
      await Transaction.insertMany(transactions);
      console.log(`Successfully generated ${transactions.length} fake transactions.`);
    } else {
      console.log('No transactions were generated. Check that you have users with appropriate roles.');
    }
  } catch (error) {
    console.error('Error generating transactions:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the function
generateFakeTransactions()
  .then(() => console.log('Done.'))
  .catch(error => console.error('Error:', error)); 