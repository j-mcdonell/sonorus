/**
 * pages.config.js - Page routing configuration
 * * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 */
import Home from './pages/Home';
import AlbumDetail from './pages/AlbumDetail';
import AddAlbum from './pages/AddAlbum';
import Browse from './pages/Browse';
import RecentReviews from './pages/RecentReviews';
import Critics from './pages/Critics';
import CriticProfile from './pages/CriticProfile';
import Following from './pages/Following';
import __Layout from './Layout.jsx';
import Login from './pages/Login';
import Profile from './pages/Profile';

export const PAGES = {
    "Home": Home,
    "AlbumDetail": AlbumDetail,
    "AddAlbum": AddAlbum,
    "Browse": Browse,
    "RecentReviews": RecentReviews,
    "Critics": Critics,
    "CriticProfile": CriticProfile,
    "Following": Following,
    "Login": Login, 
    "Profile": Profile,
};

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};