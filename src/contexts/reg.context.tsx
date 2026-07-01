import React, { createContext, useContext, useState } from "react"

type RegContextType = {
    email: string
    setEmail: (v: string) => void
    password: string
    setPassword: (v: string) => void
    name: string
    setName: (v: string) => void
    nickname: string
    setNickname: (v: string) => void    
}

const RegContext = createContext<RegContextType | undefined>(undefined)

export function RegProvider({children} : {children: React.ReactNode}) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [nickname, setNickname] = useState('')

    return (
        <RegContext.Provider value={{email, setEmail, password, setPassword, name, setName, nickname, setNickname}}>
            {children}
        </RegContext.Provider>
    )
}

export function useReg() {
    const context = useContext(RegContext)
    if (!context) throw new Error('useReg must be used within a regProvider')
    return context
}