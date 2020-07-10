//@flow
import React, { useState } from "react";
import { CommonHeader } from "./header.js"

export function NewPlant(props: Object) {
    const [name, setName] = useState("")
    const [disabled, setDisabled] = useState(false)

    return (
        <div>
            <CommonHeader setLoggedIn={props.setLoggedIn}/>
            <h2>Add a New Plant</h2>
            <input className="new-plant-input" type="text" name="name" placeholder="Plant name"
                value={name} onChange={(event) => {setName(event.target.value)}} disabled={disabled} required />
            <label for="image" disabled={disabled}>Attach an image (optional):</label>
            <input className="new-plant-input" type="file" id="image" name="image" accept="image/png, image/jpeg" disabled={disabled} />
            <button className="new-plant-input" type="submit" onClick={() => {}} disabled={disabled}>Create</button>
        </div>
    )    
}