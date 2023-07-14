/* eslint-disable @typescript-eslint/naming-convention */
export default (query: string) => {
    return {
      fields: [
        "_id",
        "http://www w3 org/2008/05/skos-xl#literalForm",
        "http://purl org/dc/terms/language",
        "http://www w3 org/2008/05/skos-xl#literalForm"
      ],
      _source: false,
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                fields: ["http://www w3 org/1999/02/22-rdf-syntax-ns#type"],
                query: "http://www.w3.org/2008/05/skos-xl#Label"
              }
            },
            {
              query_string: {
                fields: [
                  "http://www w3 org/2008/05/skos-xl#literalForm"
                ],
                query
              }
            },
            {
              query_string: {
                fields: [
                  "http://purl org/dc/terms/language"
                ],
                query: "*"
              }
            }
          ]
        }
      }
    };
};

