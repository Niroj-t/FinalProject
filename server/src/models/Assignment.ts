import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  dueDate: Date;
  instructions?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  attachments?: string[];
}

const assignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [2000, 'Instructions cannot exceed 2000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
assignmentSchema.index({ createdBy: 1, isActive: 1 });
assignmentSchema.index({ dueDate: 1, isActive: 1 });

export default mongoose.model<IAssignment>('Assignment', assignmentSchema); 