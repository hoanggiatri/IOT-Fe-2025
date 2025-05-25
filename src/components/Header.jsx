import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../firebase/auth";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Typography,
} from "antd";
import {
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
  HomeOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  DashboardOutlined,
  LineChartOutlined,
  RocketOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import "../styles/layout/Header.css";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userLoggedIn } = useAuth();

  // Notifications
  const notifications = [
    { id: 1, message: "Gas level warning detected", read: false },
    { id: 2, message: "Smart light activated", read: true },
    { id: 3, message: "Temperature is optimal", read: false },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Menu for user dropdown
  const userMenu = {
    items: [
      {
        key: "1",
        icon: <UserOutlined />,
        label: "Profile",
      },
      {
        key: "2",
        icon: <SettingOutlined />,
        label: "Settings",
      },
      {
        type: "divider",
      },
      {
        key: "3",
        icon: <LogoutOutlined />,
        label: "Logout",
        danger: true,
        onClick: () => {
          doSignOut().then(() => {
            navigate("/login");
          });
        },
      },
    ],
  };

  // Menu for notifications dropdown
  const notificationsMenu = {
    items: [
      {
        key: "header",
        label: (
          <div className="notification-header">
            <span>Notifications</span>
            <Badge count={unreadCount} size="small" />
          </div>
        ),
        disabled: true,
      },
      ...notifications.map((notification) => ({
        key: notification.id.toString(),
        label: (
          <div
            className={`notification-item ${
              !notification.read ? "unread" : ""
            }`}
          >
            <span>{notification.message}</span>
            {!notification.read && <div className="notification-dot" />}
          </div>
        ),
      })),
      {
        type: "divider",
      },
      {
        key: "footer",
        label: (
          <div className="notification-footer">
            <Button type="link" size="small">
              View All
            </Button>
          </div>
        ),
        disabled: true,
      },
    ],
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <RocketOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "detail",
      icon: <LineChartOutlined />,
      label: <Link to="/detail">Analytics</Link>,
    },
  ];

  return (
    <AntHeader className="modern-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              <DashboardOutlined />
            </div>
            <div className="logo-text">
              <Title level={4}>Smart IoT</Title>
            </div>
          </Link>
        </div>

        {/* Navigation Menu - Only show when logged in */}
        {userLoggedIn && (
          <div className="nav-section">
            <Menu
              mode="horizontal"
              selectedKeys={[
                location.pathname.split("/")[1] || "dashboard",
              ]}
              items={menuItems}
              className="main-nav"
            />
          </div>
        )}

        {/* Right Section */}
        <div className="right-section">
          {userLoggedIn ? (
            <Space size="middle">
              {/* Status Indicator */}
              <div className="status-indicator">
                <WifiOutlined />
                <span>Online</span>
              </div>

              {/* Notifications */}
              <Dropdown
                menu={notificationsMenu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button type="text" className="action-btn">
                  <Badge count={unreadCount} size="small">
                    <BellOutlined />
                  </Badge>
                </Button>
              </Dropdown>

              {/* User Profile */}
              <Button type="primary" danger className="auth-btn" onClick={() => { doSignOut().then(() => { navigate('/login') }) }}>
                <UserOutlined /> Đăng xuất
              </Button>
            </Space>
          ) : (
            <Space>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                className="auth-btn"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button icon={<UserAddOutlined />} className="auth-btn secondary">
                <Link to="/register">Register</Link>
              </Button>
            </Space>
          )}
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
