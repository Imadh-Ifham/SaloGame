import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model';
import { generateToken } from '../utils/jwt';

export const registerUser = async (req: Request, res: Response , next: NextFunction) : Promise<Response | void> => {
  try {
    const { email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, role });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const user = await User.findByIdAndUpdate(id, { email, role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

