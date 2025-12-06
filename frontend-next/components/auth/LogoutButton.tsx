import { Button, ButtonProps } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

interface LogoutButtonProps extends Omit<ButtonProps, 'onClick'> {
    // Additional props can be added here
}

export default function LogoutButton(props: LogoutButtonProps) {
    const handleLogout = () => {
        window.location.href = '/api/auth/logout';
    };

    return (
        <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            {...props}
        >
            Sign Out
        </Button>
    );
}
