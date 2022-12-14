import * as React from "react"
import { Status } from "./models/status.model"

interface IUserContext {
    user: string | Status,
    changeUser: (user: string | Status) => void,
}

export const UserContext = React.createContext<IUserContext>({
    user: Status.DontKnow,
    changeUser: () => {}
});