//@flow
import React, { useState } from "react";
import { CommonHeader } from "./header.js"

export function NewPlant(props: Object) {
    const [name, setName] = useState("")
    const [disabled, setDisabled] = useState(false)

    return (
        <div>
            <CommonHeader setLoggedIn={props.setLoggedIn}/>
            <form className="new-plant-form" onSubmit={() => {}}>
                <input className="new-plant-input" type="text" name="name" placeholder="Plant name"
                    value={name} onChange={(event) => {setName(event.target.value)}} disabled={disabled} required />
                <label for="image">Attach an image (optional):</label>
                <input type="file" id="image" name="image"></input>
                <button type="submit" disabled={disabled}>Create</button>
            </form>
        </div>
    )    
}