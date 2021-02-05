import { graphql } from "react-relay"

export const userPlantsQuery = graphql`
query userPlantsQuery($userID: ID!) {
    user(id: $userID) {
        plantConnection {
            totalCount
            edges {
                node {
                    ...plantPreview_plant
                }
            }
        }
    }
}
`;