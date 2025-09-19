import { Link } from 'react-router'
import './Fallback.css'

function Fallback() {
    return (
        <section className="page_404 h-full mx-auto">
            <div className="container  px-4">
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center w-full max-w-3xl">

                        <div className="four_zero_four_bg flex items-center justify-center ">
                            <h1 className='txt_404'>404</h1>
                        </div>
                        <div>
                            <h3>Look like you're lost</h3>
                            <p>The page you are looking for is not available!</p>

                            <Link to="/" className="link_404">
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Fallback