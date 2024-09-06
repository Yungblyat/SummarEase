import "../styles/Home.css"

function Home() {
    return (
    <>
        <div>
            <nav className="navbar">
                <ul className="nav-list">
                    <li><a href="/">Home</a></li>
                    <li><a href="/upload">Upload</a></li>
                    <li><a href="/history">History</a></li>
                    <li><a href="/logout">Logout</a></li>
                </ul>
            </nav>
        </div>
    </>
    )
}

export default Home