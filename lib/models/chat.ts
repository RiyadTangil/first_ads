import mongoose, { Schema, Document, Model } from 'mongoose';

// Message interface
export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  text: string;
  timestamp: Date;
  read: boolean;
  senderType: 'user' | 'admin';
}

// Conversation interface
export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
}

// Message schema
const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    senderType: { type: String, enum: ['user', 'admin'], required: true }
  },
  { timestamps: true }
);

// Conversation schema
const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    unreadCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Create models if they don't exist
export const Message = mongoose.models.Message as Model<IMessage> || 
  mongoose.model<IMessage>('Message', MessageSchema);

export const Conversation = mongoose.models.Conversation as Model<IConversation> || 
  mongoose.model<IConversation>('Conversation', ConversationSchema); 