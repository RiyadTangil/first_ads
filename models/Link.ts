import mongoose from 'mongoose';

export interface ILink extends mongoose.Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Link name is required'],
    trim: true,
    maxlength: [100, 'Link name cannot exceed 100 characters']
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    maxlength: [2048, 'URL cannot exceed 2048 characters'],
    // match: [
    //   /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    //   'Please provide a valid URL'
    // ]
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  impressions: {
    type: Number,
    default: 0,
    min: [0, 'Impressions cannot be negative']
  },
  clicks: {
    type: Number,
    default: 0,
    min: [0, 'Clicks cannot be negative']
  },
  ctr: {
    type: Number,
    default: 0,
    min: [0, 'CTR cannot be negative'],
    max: [100, 'CTR cannot exceed 100%']
  },
  cpm: {
    type: Number,
    default: 0,
    min: [0, 'CPM cannot be negative']
  },
  revenue: {
    type: Number,
    default: 0,
    min: [0, 'Revenue cannot be negative']
  }
}, {
  timestamps: true
});

// Create method to calculate metrics
LinkSchema.methods.calculateMetrics = function() {
  if (this.impressions > 0) {
    this.ctr = (this.clicks / this.impressions) * 100;
    // Assuming $5 CPM as a baseline
    this.revenue = (this.impressions / 1000) * (this.cpm || 5);
  }
};

// Create index for faster queries
LinkSchema.index({ userId: 1, status: 1 });
LinkSchema.index({ createdAt: -1 });
const Link =  mongoose.models.Link|| mongoose.model<ILink>('Link', LinkSchema); 

export default Link

// export default mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema); 