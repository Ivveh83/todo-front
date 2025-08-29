
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { useAuth } from '../context/AuthContext.jsx';

const LoginForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(formData.username, formData.password); // authServices.login() gör att token och all data som finns i dto/AuthResponseDto sparas i localStorage. 
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="col-12 col-md-8 login-form-container">
            <div className="login-form-wrapper">
                <div className="mobile-brand d-md-none">
                    <i className="bi bi-card-checklist"></i>
                    <h4>To-do App</h4>
                </div>

                <div className="login-header">
                    <h1>
                        <i className="bi bi-check2-square"></i>
                        <span>Login</span>
                    </h1>
                    <p>Enter your credentials to access your account</p>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-group">
                            <i className="bi bi-person input-icon"></i>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="form-input"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-group">
                            <i className="bi bi-lock input-icon"></i>
                            <input
                                type={isPasswordVisible ? "text" : "password"}
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                disabled={isLoading}
                            >
                                <i className={`bi bi-eye${isPasswordVisible ? '-slash' : ''}`}></i>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span>Signing In</span>
                                <i className="bi bi-arrow-repeat spin"></i>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <i className="bi bi-arrow-right"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="mobile-footer d-md-none">
                    <p>© 2025 To-do App. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;