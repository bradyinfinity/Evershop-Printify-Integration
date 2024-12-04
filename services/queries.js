export const ATTRIBUTE_QUERY = `
  query GetAttributes($filters: [FilterInput!]) {
    attributes: attributes(filters: $filters) {
      items {
        uuid
        attributeName
        attributeCode
        attributeId
        options { 
          attributeOptionId
          uuid
          optionText
        }
      }
    }
  }
`;

export const ATTRIBUTE_GROUP_QUERY = `
  query GetAttributeGroups($filters: [FilterInput!]) {
    groups: attributeGroups(filters: $filters) {
      items {
        uuid
        groupId: attributeGroupId
        groupName
      }
    }
  }
`;

export const CATEGORY_QUERY = `
  query GetCategories($filters: [FilterInput!]) {
    categories (filters: $filters) {
      items {
        categoryId
        uuid
        name
        status
      }
    }
  }
`;