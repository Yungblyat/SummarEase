import { useState } from "react";
import api from "../api"
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFREST_TOKEN } from "../constants";
import "../styles/Form.css"

function Form({route, method}) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const name = method === "login" ? "Login":"Register"

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            const res = await api.post(route, {username, password})
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFREST_TOKEN, res.data.refresh);
                navigate("/")
            } else {
                navigate("/login")
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }

    }

    return <form onSubmit={handleSubmit} className="form-container">
        <h1>{name}</h1>
        {/* <input 
            type="email" 
            className="form-input" 
            value={email} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Email" /> */}
        <input 
            type="text" 
            className="form-input" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Username" />
        <input 
            type="password" 
            className="form-input" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" />
        <button className="form-button" tpe="submit">
            {name}
        </button>
    </form>
}

export default Form