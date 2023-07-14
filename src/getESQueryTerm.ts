/* eslint-disable @typescript-eslint/naming-convention */
export default (termId: string) => {
  return {
    fields: [],
    _source: false,
    query: {
      bool: {
        must: [
          {
            simple_query_string: {
              fields: ["http://www w3 org/1999/02/22-rdf-syntax-ns#type"],
              query: "http://vocab.getty.edu/ontology#Concept",
            },
          },
          {
            query_string: {
              fields: [
                "http://www w3 org/2008/05/skos-xl#prefLabel",
                "http://www w3 org/2008/05/skos-xl#altLabel",
              ],
              query: `"${termId}"`,
            },
          },
        ],
      },
    },
  };
};
