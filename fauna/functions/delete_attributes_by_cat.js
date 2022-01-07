import { query as q } from "faunadb";

export default {
  name: "delete_attributes_by_cat",
  role: null,
  body: q.Query(
    q.Lambda(
      ["x"],
      q.Select(
        "data",
        q.Map(
          q.Paginate(
            q.Match(
              q.Index("attribute_Cat_by_cat"),
              q.Ref(q.Collection("Cat"), q.Var("x"))
            )
          ),
          q.Lambda("i", q.Delete(q.Var("i")))
        )
      )
    )
  ),
};
