export const validateSignup = (username, email, password, confirmPassword) => {
    const errors = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    }

    if (!username || username.length < 6){
        errors.username = 'Username must be at least 6 characters long'
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
        errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    } else if (!passwordRegex.test(password)) {
        errors.password = 'Password must contain at least 1 number and 1 special character';
    }

    if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return {
        isValid: !errors.username && !errors.email && !errors.password && !errors.confirmPassword,
        errors
    };
}

export const validateLogin = (username, password) => {
    const errors = {
        username: '',
        password: ''
    }

    if (!username){
        errors.username = 'Username should not be empty'
    } else if (username.length < 6) {
        errors.username = 'Invalid username'
    }

    if (!password) {
        errors.password = 'Password should not be empty'
    } else if (password.length < 6){
        errors.password = 'Invalid password'
    }

    return {
        isValid: !errors.username && !errors.password,
        errors
    };
}

export const handleLogin = async (username, password, setErrors, navigate, toast) => {
    const loginValidation = validateLogin(username, password);
    
    if (loginValidation.isValid) {
        try {
            const response = await fetch("http://stackture.eloquenceprojects.org/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.error) {
                switch(data.error) {
                    case "InvalidCredentials":
                        setErrors(prev => ({...prev, password: "Invalid username or password"}));
                        break;
                    case "InvalidRequest":
                        toast.error("Invalid request format");
                        break;
                    case "TokenCreationFailed":
                    case "DatabaseOperationFailed":
                    default:
                        toast.error("Login failed. Please try again later.");
                }
                return false;
            } else if (data.token) {
                localStorage.setItem("authToken", data.token);
                navigate("/dashboard");
                toast.success("Successfully logged in");
                return true;
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed. Please check your connection.");
            return false;
        }
    } else {
        setErrors(loginValidation.errors);
        return false;
    }
}

export const handleSignup = async (username, email, password, confirmPassword, setErrors, navigate, toast, closeAuth) => {
    const signupValidation = validateSignup(username, email, password, confirmPassword);
    
    if (signupValidation.isValid) {
        try {
            const response = await fetch("http://stackture.eloquenceprojects.org/auth/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (response.status === 200) {
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                    toast.success("Successfully registered!");
                    closeAuth();
                    navigate("/dashboard");
                    return true;
                } else {
                    toast.error("Registration successful but no token received");
                    return false;
                }
            } else {
                const data = await response.json();
                throw new Error(data.error || `Error: ${response.status}`);
            }
        } catch (error) {
            console.error("Registration error:", error.message);
            if (error.message === "UserAlreadyExists") {
                setErrors(prev => ({...prev, username: "Username already exists"}));
            } else if (error.message === "EmailAlreadyUsed") {
                setErrors(prev => ({...prev, email: "Email already in use"}));
            } else {
                toast.error(`Registration failed: ${error.message}`);
            }
            return false;
        }
    } else {
        setErrors(signupValidation.errors);
        return false;
    }
}