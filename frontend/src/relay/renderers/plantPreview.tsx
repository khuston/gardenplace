import * as React from "react";
import environment from "../lib/createRelayEnvironment"
import { createFragmentContainer, QueryRenderer } from "react-relay"
import * as styles from "../../css/gardenplace.css"
import { userPlantsQuery } from "../operations/userPlants"
import { graphql } from "react-relay"

export default function UserPlantsPreviewRenderer() {
    return (
        <QueryRenderer
            environment={environment}
            query={userPlantsQuery}
            variables={{}}
            render={({error, props}: {error: Error, props: any}) => {
                if (error) {
                    return <div>{error.message}</div>;
                } else if (props) {
                    return <PlantPreviewRelay plant={props.plant} />;
                }

                return <div>Loading</div>;
            }}
        />
    )
}

const PlantPreviewRelay = createFragmentContainer(PlantPreview, {
    plant: graphql`
        fragment plantPreview_plant on Plant {
            name
            garden {
                name
            }
            imageConnection(next: 1) {
                edges {
                    node {
                        url
                    }
                }
            }
        }
    `,
})

function PlantPreview(props: any) {
    const {name, image, description} = props.plant;
    const imageUrl = image ? image.url : gardenplaceConfiguration.publicStaticDir + "/generic-plant.png";

    return (
        <React.Fragment>
            <img className={styles.myPlantsThumbnail} src={imageUrl} />
            <div className={styles.plantPreviewName}>{name}</div>
            <div className={styles.plantPreviewDescription}>{description}</div>
        </React.Fragment>
    )
}