'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Drawer,
  Toolbar,
  Divider,
  IconButton,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
} from "@mui/icons-material";

interface NavItem {
  title: string;
  path?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", path: "/admin/dashboard" },
  {
    title: "Customers",
    children: [
      { title: "Customers List", path: "/admin/customers" },
      { title: "Orders", path: "/admin/orders" },
      { title: "Invoices", path: "/admin/invoices" },
    ],
  },
  {
    title: "Vendors",
    children: [
      { title: "Vendors List", path: "/admin/vendors" },
      { title: "Vendor Comparison", path: "/admin/vendors/comparison" },
      { title: "Purchase Orders", path: "/admin/purchase-orders" },
      { title: "Vendor Invoices", path: "/admin/vendor-invoices" },
    ],
  },
  {
    title: "Box Designs",
    children: [
      { title: "Designs", path: "/admin/box-designs" },
      { title: "Box Types", path: "/admin/box-types" },
      { title: "Materials", path: "/admin/materials" },

      
    ],
  },
  {
    title: "Sales",
    children: [
      { title: "Quotations", path: "/admin/quotations" },
      { title: "Orders", path: "/admin/orders" },
      { title: "Invoices", path: "/admin/invoices" },
    ],
  },
  {
    title: "Inventory",
    children: [
      { title: "Stocks & Movements", path: "/admin/inventory" },
      { title: "Raw Materials", path: "/admin/materials" },
    ],
  },
  { title: "Production", path: "/admin/production" },
  { title: "Expenses", path: "/admin/expenses" },
  {
    title: "Reports",
    children: [
      { title: "All Reports", path: "/admin/reports" },
    ],
  },
  {
    title: "Settings",
    children: [
      { title: "General Settings", path: "/admin/settings" },
      { title: "Currencies", path: "/admin/currencies" },
    ],
  },
];

export default function Header() {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggle = (title: string) => {
    setOpenModules(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderNav = (items: NavItem[]) => {
    return items.map(item => {
      if (item.children) {
        return (
          <Box key={item.title}>
            <ListItemButton onClick={() => handleToggle(item.title)}>
              <ListItemText primary={item.title} />
              {openModules[item.title] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openModules[item.title]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 4 }}>
                {renderNav(item.children)}
              </List>
            </Collapse>
          </Box>
        );
      }
      return (
        <ListItemButton
          key={item.title}
          component={Link}
          href={item.path || "#"}
        >
          <ListItemText primary={item.title} />
        </ListItemButton>
      );
    });
  };

  return (
    <>
      {/* Mobile Drawer */}
      <IconButton
        color="inherit"
        edge="start"
        onClick={() => setDrawerOpen(true)}
        sx={{ ml: 1, display: { sm: "none" } }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="temporary"
        sx={{ display: { xs: "block", sm: "none" } }}
      >
        <Toolbar />
        <Divider />
        <List>{renderNav(navItems)}</List>
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: 240,
          display: { xs: "none", sm: "block" },
          borderRight: "1px solid #ddd",
          minHeight: "100vh",
          position: "fixed",
          bgcolor: "background.paper",
        }}
      >
        <Toolbar>
          <Typography variant="h6">ZeeERP</Typography>
        </Toolbar>
        <Divider />
        <List>{renderNav(navItems)}</List>
      </Box>
    </>
  );
}
