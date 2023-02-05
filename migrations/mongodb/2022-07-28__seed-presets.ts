import type { MongoClient, ObjectId } from "../../src/shared/deps/db.ts";
import type { SearchCriteriaPreset } from "../../src/shared/model.ts";

type SearchCriteriaPresetSchema = {
  _id: ObjectId;
} & SearchCriteriaPreset;

export async function up(client: MongoClient) {
  const db = client.database("ticket-monitor");
  const presetsCollection = db.collection<SearchCriteriaPresetSchema>(
    "search-criteria-presets"
  );
  await presetsCollection.insertMany([
    {
      title: "Knock Out Productions",
      searchCriteria: {
        type: "css-selector",
        selector: "div.grid.grid-cols-2.gap-2.text-white.text-1375xl",
        child: {
          type: "node-name",
          nodeName: "ADD-TO-CART",
        },
      },
    },
  ]);
}
