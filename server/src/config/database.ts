import mongoose from 'mongoose';
import { MONGODB_URI, NODE_ENV } from '#src/constant.ts';

if (!MONGODB_URI && NODE_ENV === 'development') {
  console.warn(
    'WARNING: $MONGODB_URI is not set. MongoDB connection will fail on usage.'
  );
}

export async function connectDB() {
  await mongoose.connect(MONGODB_URI || '');
}

export default mongoose;
