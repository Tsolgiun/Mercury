import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { hashPassword } from '../utils/authUtils';
import UserModel from '../models/userModel';
import PostModel from '../models/postModel';
import CommentModel from '../models/commentModel';
import BookmarkModel from '../models/bookmarkModel';
import FollowModel from '../models/followModel';
import LikeModel from '../models/likeModel';
import connectDB from '../config/db';

// Load environment variables
dotenv.config();

// Sample admin user
const adminUser = {
  password: '123456',  // This will be hashed before user creation
  name: 'Admin User',
  email: 'admin@mercury.com',
  username: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
  bio: 'Administrator of Mercury - a monochrome content platform blending Medium and Threads.',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Sample posts
const samplePosts = [
  {
    title: 'Welcome to Mercury',
    type: 'long',
    blocks: [
      {
        type: 'paragraph',
        content: 'Mercury is a monochrome content platform that blends the clean, long-form publishing feel of Medium with the social conversational structure of Threads.'
      },
      {
        type: 'paragraph',
        content: 'This platform acts like a digital library, where users can post short content ("threads") or long blog-style posts. Content is organized using a unified block-based model.'
      },
      {
        type: 'heading',
        content: 'Key Features',
        level: 2
      },
      {
        type: 'paragraph',
        content: 'Mercury offers a range of features designed to enhance your content creation and consumption experience:'
      },
      {
        type: 'paragraph',
        content: '• Clean, minimalist design focused on readability\n• Support for both short-form and long-form content\n• Block-based editor for flexible content creation\n• Social features like comments, likes, and follows\n• Bookmarking for saving content for later'
      },
      {
        type: 'heading',
        content: 'Getting Started',
        level: 2
      },
      {
        type: 'paragraph',
        content: 'To get started with Mercury, simply create an account and start exploring content. When you\'re ready, click the "Write" button in the navigation bar to create your first post.'
      },
      {
        type: 'quote',
        content: 'The best way to predict the future is to create it. - Peter Drucker'
      },
      {
        type: 'paragraph',
        content: 'We hope you enjoy using Mercury and find it a valuable platform for sharing your thoughts and ideas with the world.'
      }
    ],
    tags: ['welcome', 'introduction', 'mercury'],
    coverImage: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    readingTime: 3,
    comments: 0,
    likes: 0
  },
  {
    title: 'The Art of Minimalist Design',
    type: 'long',
    blocks: [
      {
        type: 'paragraph',
        content: 'Minimalist design is more than just an aesthetic choice—it\'s a philosophy that emphasizes simplicity, clarity, and purpose.'
      },
      {
        type: 'paragraph',
        content: 'In a world filled with constant noise and visual clutter, minimalist design offers a refreshing approach that focuses on what truly matters.'
      },
      {
        type: 'heading',
        content: 'Core Principles of Minimalist Design',
        level: 2
      },
      {
        type: 'paragraph',
        content: 'Minimalist design is guided by several key principles:'
      },
      {
        type: 'paragraph',
        content: '1. **Simplicity**: Removing unnecessary elements to focus on what\'s essential.\n2. **Negative Space**: Using empty space strategically to create balance and focus.\n3. **Limited Color Palette**: Often monochromatic or with very few colors.\n4. **Typography**: Clean, readable fonts that enhance rather than distract.'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80',
        content: 'Minimalist interior design example'
      },
      {
        type: 'heading',
        content: 'Benefits of Minimalist Design',
        level: 2
      },
      {
        type: 'paragraph',
        content: 'Adopting a minimalist approach to design offers numerous benefits:'
      },
      {
        type: 'paragraph',
        content: '• **Improved User Experience**: Clearer navigation and reduced cognitive load.\n• **Faster Load Times**: Fewer elements mean faster loading websites and applications.\n• **Timelessness**: Minimalist designs tend to age well and remain relevant longer.\n• **Focus on Content**: The content becomes the star, not the design elements.'
      },
      {
        type: 'quote',
        content: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away. - Antoine de Saint-Exupéry'
      },
      {
        type: 'paragraph',
        content: 'As we continue to navigate an increasingly complex digital landscape, the principles of minimalist design offer a valuable compass for creating experiences that are both beautiful and functional.'
      }
    ],
    tags: ['design', 'minimalism', 'aesthetics'],
    coverImage: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2067&q=80',
    readingTime: 5,
    comments: 0,
    likes: 0
  },
  {
    type: 'short',
    blocks: [
      {
        type: 'paragraph',
        content: 'Just launched Mercury - a monochrome content platform blending the best of Medium and Threads. Clean, minimal, and focused on what matters most: your content.'
      }
    ],
    tags: ['launch', 'announcement'],
    readingTime: 1,
    comments: 0,
    likes: 0
  },
  {
    type: 'short',
    blocks: [
      {
        type: 'paragraph',
        content: 'Design tip: Embrace white space. It\'s not empty space—it\'s breathing room for your content. The best designs often come from what you choose to leave out, not what you add in.'
      }
    ],
    tags: ['design', 'tips'],
    readingTime: 1,
    comments: 0,
    likes: 0
  },
  {
    title: 'The Power of Typography in Web Design',
    type: 'long',
    blocks: [
      {
        type: 'paragraph',
        content: 'Typography is often the unsung hero of web design. While images and colors might grab immediate attention, it\'s typography that does the heavy lifting of communication.'
      },
      {
        type: 'paragraph',
        content: 'Good typography isn\'t just about choosing a nice font—it\'s about creating a reading experience that serves the content and engages the reader.'
      },
      {
        type: 'heading',
        content: 'Why Typography Matters',
        level: 2
      },
      {
        type: 'paragraph',
        content: 'Typography affects how we perceive content in several important ways:'
      },
      {
        type: 'paragraph',
        content: '• **Readability**: Good typography makes content easy to read and understand.\n• **Brand Identity**: Typography helps establish and reinforce brand personality.\n• **Hierarchy**: It guides readers through content by establishing what\'s most important.\n• **Emotion**: Different typefaces evoke different emotional responses.'
      },
      {
        type: 'heading',
        content: 'Key Elements of Typography',
        level: 2
      },
      {
        type: 'paragraph',
        content: 'Mastering typography requires understanding several key elements:'
      },
      {
        type: 'paragraph',
        content: '1. **Typeface Selection**: Choosing fonts that match your content\'s purpose and tone.\n2. **Font Size**: Ensuring comfortable reading across different devices.\n3. **Line Height**: Providing enough space between lines for easy reading.\n4. **Line Length**: Keeping lines at an optimal length (around 50-75 characters).\n5. **Contrast**: Ensuring text stands out clearly against its background.'
      },
      {
        type: 'code',
        content: 'body {\n  font-family: "Inter", sans-serif;\n  font-size: 16px;\n  line-height: 1.6;\n  color: #000000;\n}\n\nh1 {\n  font-size: 2rem;\n  font-weight: 700;\n  margin-bottom: 1.5rem;\n}',
        language: 'css'
      },
      {
        type: 'paragraph',
        content: 'The CSS above demonstrates some basic typography principles for web design, using the Inter font family that we use here on Mercury.'
      },
      {
        type: 'quote',
        content: 'Typography is what language looks like. - Ellen Lupton'
      },
      {
        type: 'paragraph',
        content: 'As we continue to design for an increasingly text-heavy digital world, thoughtful typography remains one of the most powerful tools in a designer\'s toolkit.'
      }
    ],
    tags: ['design', 'typography', 'web'],
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80',
    readingTime: 6,
    comments: 0,
    likes: 0
  }
];

// Seed data function
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await UserModel.deleteMany({});
    await PostModel.deleteMany({});
    await CommentModel.deleteMany({});
    await BookmarkModel.deleteMany({});
    await FollowModel.deleteMany({});
    await LikeModel.deleteMany({});
    
    console.log('Previous data cleared');
    
    // Create admin user with hashed password
    const hashedPassword = await hashPassword(adminUser.password);
    const user = await UserModel.create({
      ...adminUser,
      password: hashedPassword
    });
    console.log(`Created admin user: ${user.name}`);
    
    // Create posts
    const createdPosts = await Promise.all(
      samplePosts.map(async (post) => {
        const newPost = await PostModel.create({
          ...post,
          author: user._id,
          authorId: user._id.toString()
        });
        return newPost;
      })
    );
    
    console.log(`Created ${createdPosts.length} sample posts`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
