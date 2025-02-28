export const validateSignup = (username, email, password, confirmPassword) => {
    const errors = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    }

    if (!username || username.length < 6){
        errors.username = 'Username must be at least 6 characters long'
    } else if (username) {

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
        errors.password = 'Password must be at least 6 characters long with 1 number, and 1 special character';
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