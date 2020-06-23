import { Model, Field } from "../model.ts";
import { testDB } from "../testutils.ts";
import { assertEquals } from "../../testdeps.ts";
import { QueryBuilder } from "../querybuilder.ts";

class User extends Model {
  static tableName = "users";

  @Field()
  email!: string;

  @Field()
  age!: number;

  @Field()
  created_at!: Date;
}

class Product extends Model {
  static tableName = "products";

  @Field()
  name!: string;
}

testDB(
  "BaseAdapter: `addModel` should populate `adapter` property",
  (client) => {
    client.addModel(User);

    assertEquals(User.adapter, client);
  },
);

testDB(
  "BaseAdapter: `getModels` should return an array containing all classes of the registered Models ",
  (client) => {
    client.addModel(User);
    client.addModel(Product);

    const models = client.getModels();

    assertEquals(models.length, 2);
    assertEquals(models[0], User);
    assertEquals(models[1], Product);
  },
);

testDB(
  "BaseAdapter: `truncateModels` should truncate all registered model tables",
  async (client) => {
    const date = new Date("5 June, 2020");

    client.addModel(User);
    client.addModel(Product);

    await User.insert({
      email: "a@b.com",
      age: 16,
      created_at: date,
    });

    await User.insert({
      email: "b@c.com",
      age: 16,
      created_at: date,
    });

    await Product.insert({ name: "notebook" });
    await Product.insert({ name: "pen" });

    await client.truncateModels();

    const users = await User.find();
    const products = await Product.find();

    assertEquals(users.length, 0);
    assertEquals(products.length, 0);
  },
);

testDB(
  "BaseAdapter: `table` should contains actual query builder",
  (client) => {
    const query = client.table("users");
    assertEquals(query instanceof QueryBuilder, true);
  },
);
