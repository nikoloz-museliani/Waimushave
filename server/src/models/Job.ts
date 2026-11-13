import { Schema, model } from 'mongoose'

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, default: 'Other' },
    images: [String], // e.g. "/uploads/abc123.jpg"

    // contact
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },

    // location
    city: { type: String, required: true, trim: true, index: true },
    street: { type: String, required: true, trim: true },
    location: { lat: Number, lng: Number }, // google maps pin (optional)

    // price
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    priceType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },

    startDate: Date,

    // open -> in_progress (someone accepted) -> done
    status: { type: String, enum: ['open', 'in_progress', 'done'], default: 'open', index: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    completedAt: Date,

    // payments: flip this to true once you charge for posting
    paid: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const Job = model('Job', jobSchema)
