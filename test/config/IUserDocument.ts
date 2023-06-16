import { Document, model, Schema, Collection} from "mongoose";
import FlattenMaps from "mongoose"
export interface IUserDocument extends Document {
  name: string;
  email: string;
  subdocs: Document[];
}

export class UserDocumentMock<T> implements IUserDocument {
  name: string;
  email: string;
  subdocs: Document[];

  collection: Collection<Document<T>>;

  toJSON(options?: unknown): T | FlattenMaps<T> {
    return this.collection.model.toJSON(this, options) as T;
  }
}

export const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subdocs: [{ type: Schema.Types.ObjectId, ref: 'Subdoc' }],
});
