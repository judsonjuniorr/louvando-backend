import mongoose from 'mongoose';

const ChangelogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['create', 'delete', 'update', 'info'],
    },
    user_id: {
      type: Number,
    },
    section: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Changelog', ChangelogSchema);
