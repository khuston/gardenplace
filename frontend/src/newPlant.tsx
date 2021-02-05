import * as React from "react";
import { useState } from "react";
import { CommonHeader } from "./header"
import { PropsWithHandleLogout } from "./props"
import * as styles from "./css/gardenplace.css"


export function NewPlant(props: PropsWithHandleLogout) {
    const [name, setName] = useState<string>("")
    const [disabled, setDisabled] = useState<boolean>(false)
    const [files, setFiles] = useState<FileList>()

    return (
        <div>
            <CommonHeader handleLogout={props.handleLogout}/>
            <h2>Add a New Plant</h2>

            <input className={styles.newPlantInput} type="text" name="name" placeholder="Plant name"
                value={name} onChange={(event) => {setName(event.target.value)}} disabled={disabled} required />

            <label htmlFor="image">Attach an image (optional):</label>

            <ImagePreview files={files} />

            <input className={styles.newPlantInput} type="file" id="image" name="image" accept="image/png, image/jpeg" 
                onChange={(event) => {setFiles(event.target.files)}} disabled={disabled} />

            <button className={styles.newPlantInput} type="submit" onClick={() => {}} disabled={disabled}>Create</button>
        </div>
    )    
}

interface PropsWithFiles {
    files: FileList
}

function ImagePreview(props: PropsWithFiles) {
    return (
        <div>{props.files}</div>
    )

}