import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";
import React, { createContext, useEffect, useState, Suspense } from "react"; 
import { lookInSession } from "./common/session";

const Editor = React.lazy(() => import("./pages/editor.pages"));
const HomePage = React.lazy(() => import("./pages/home.page"));
const SearchPage = React.lazy(() => import("./pages/search.page"));
const PageNotFound = React.lazy(() => import("./pages/404.page"));
const ProfilePage = React.lazy(() => import("./pages/profile.page"));
const BlogPage = React.lazy(() => import("./pages/blog.page"));
const SideNav = React.lazy(() => import("./components/sidenavbar.component"));
const ChangePassword = React.lazy(() => import("./pages/change-password.page"));
const EditProfile = React.lazy(() => import("./pages/edit-profile.page"));
const Notifications = React.lazy(() => import("./pages/notifications.page"));
const ManageBlogs = React.lazy(() => import("./pages/manage-blogs.page"));
const HeroSection = React.lazy(() => import("./components/hero.component"));
const AboutUsPage = React.lazy(() => import("./pages/about-us.page"));
const UserAuthForm = React.lazy(() => import("./pages/userAuthForm.page")); // Lazy-load UserAuthForm

import Loader from "./components/loader.component";

export const UserContext = createContext({});
export const ThemeContext = createContext({});

const darkThemePreference = () => window.matchMedia("(prefers-color-scheme: light)").matches;

const App = () => {
    const [userAuth, setUserAuth] = useState({});
    const [theme, setTheme] = useState(() => darkThemePreference() ? "dark" : "light");

    useEffect(() => {
        // Disable right-click
        const handleRightClick = (e) => e.preventDefault();
        document.addEventListener("contextmenu", handleRightClick);

        let userInSession = lookInSession("user");
        let themeInSession = lookInSession("theme");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null });

        if (themeInSession) {
            setTheme(() => {
                document.body.setAttribute('data-theme', themeInSession);
                return themeInSession;
            });
        } else {
            document.body.setAttribute('data-theme', theme);
        }

        // Cleanup the event listener when component unmounts
        return () => {
            document.removeEventListener("contextmenu", handleRightClick);
        };
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <UserContext.Provider value={{ userAuth, setUserAuth }}>
                <Suspense fallback={<Loader />}> {/* Use the Loader component here */}
                    <Routes>
                        <Route path="/editor" element={<Editor />} />
                        <Route path="/editor/:blog_id" element={<Editor />} />
                        <Route path="/" element={<Navbar />}> 
                            <Route index element={<HeroSection />} />
                            <Route path="/latest" element={<HomePage />} />
                            <Route path="dashboard" element={<SideNav />} >
                                <Route path="blogs" element={<ManageBlogs />} />
                                <Route path="notifications" element={<Notifications />} />
                            </Route>
                            <Route path="settings" element={<SideNav />} >  
                                <Route path="edit-profile" element={<EditProfile />} />
                                <Route path="change-password" element={<ChangePassword />} />
                            </Route>
                            <Route path="signin" element={<UserAuthForm type="sign-in" />} /> 
                            <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                            <Route path="search/:query" element={<SearchPage />} />
                            <Route path="user/:id" element={<ProfilePage />} />
                            <Route path="blog/:blog_id" element={<BlogPage />} />
                            <Route path="/about-us" element={<AboutUsPage />} />
                            <Route path="*" element={<PageNotFound />} /> 
                        </Route>
                    </Routes>
                </Suspense>
            </UserContext.Provider>
        </ThemeContext.Provider>
    );
}

export default App;
