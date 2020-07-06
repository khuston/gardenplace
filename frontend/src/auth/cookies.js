import Cookies from 'js-cookie';

export default function GetCookies() {
    return {
        email: Cookies.get("Email"),
        token: Cookies.get("__Secure-Token")
    }
}