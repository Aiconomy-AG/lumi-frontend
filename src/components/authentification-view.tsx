import { useState } from 'react'

export function AuthView({ onLogin }: { onLogin: () => void }) {
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (email && password) {
            onLogin()
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="brand-logo">LU</div>
                    <h2>{isRegister ? 'Create account' : 'Sign in'}</h2>
                    <p>{isRegister ? 'Enter your details to get started' : 'Enter your email and password'}</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {isRegister && (
                        <div className="form-group">
                            <label>Full name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="nume@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>


                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn">
                        {isRegister ? 'Register' : 'Sign in'}
                    </button>
                </form>


                <div className="auth-footer">
                    <button className="auth-toggle-btn" onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        </div>
    )
}