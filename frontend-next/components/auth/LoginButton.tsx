import { Button, ButtonProps } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

interface LoginButtonProps extends Omit<ButtonProps, 'onClick'> {
    returnTo?: string;
}

export default function LoginButton({ returnTo, ...props }: LoginButtonProps) {
    const handleLogin = () => {
        const path = returnTo || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
        window.location.href = `/auth/login?returnTo=${encodeURIComponent(path)}`;
    };

    return (
        <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            {...props}
        >
            Sign In
        </Button>
    );
}
