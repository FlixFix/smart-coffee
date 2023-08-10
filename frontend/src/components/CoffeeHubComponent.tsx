import React, {ReactNode, useState} from 'react';
import '../styles.scss';
import "bootstrap/dist/css/bootstrap.css";
import {Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar} from "@mui/material";
import {
    IconAdjustmentsHorizontal,
    IconBrandTabler,
    IconCalendarTime,
    IconCoffee, IconCpu,
    IconInfoCircle,
    IconPlant2
} from "@tabler/icons-react";

import logo from '../assets/logo_coffee_hub.png'
import {PicoConfigDto} from "../model/pico-config-dto";

// the required distance between touchStart and touchEnd to be detected as a swipe
const minSwipeDistance = 50

export interface CoffeeHubComponentProps {
    /**
     * The current displayed content.
     */
    content: ReactNode;
    /**
     * The current config.
     */
    config: PicoConfigDto;
    /**
     * onClick event handler for clicking a menu item.
     * @param key the key of the clicked menu item.
     */
    onClickMenuItem: (key: string) => void;
}

/**
 * Main frontend component representing the basic app shell and containing the slide out menu.
 */
function CoffeeHubComponent(props: CoffeeHubComponentProps) {
    const [open, setOpen] = useState(false);

    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)


    const onTouchStart = (e: any) => {
        setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance
        if (isRightSwipe) {
            setOpen(true);
        }
        if (isLeftSwipe) {
            setOpen(false);
        }
    }

    return (
        <div className='vw-100'>
            <Drawer
                anchor='left'
                open={open}
                onClose={() => setOpen(false)}
            >
                <Toolbar variant="dense">
                    <img alt='Logo' src={logo} style={{maxHeight: '40px'}}/>
                </Toolbar>
                <Divider className='divider-creme'/>
                <List>
                    <ListItem key='dashboard' disablePadding className='font-creme'
                    onClick={(e) => {
                        e.preventDefault();
                        props.onClickMenuItem('dashboard');
                        setOpen(false);
                    }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <IconCoffee/>
                            </ListItemIcon>
                            <ListItemText primary='Dashboard'/>
                        </ListItemButton>
                    </ListItem>
                    <ListItem key='brewing' disablePadding className='font-creme'
                              onClick={(e) => {
                                  e.preventDefault();
                                  props.onClickMenuItem('brewing');
                                  setOpen(false);
                              }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <IconPlant2/>
                            </ListItemIcon>
                            <ListItemText primary='Zubereitung'/>
                        </ListItemButton>
                    </ListItem>
                    <ListItem key='calendar' disablePadding className='font-creme'
                              onClick={(e) => {
                                  e.preventDefault();
                                  props.onClickMenuItem('calendar');
                                  setOpen(false);
                              }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <IconCalendarTime/>
                            </ListItemIcon>
                            <ListItemText primary='Zeitsteuerung'/>
                        </ListItemButton>
                    </ListItem>
                    <ListItem key='pid' disablePadding className='font-creme'
                              onClick={(e) => {
                                  e.preventDefault();
                                  props.onClickMenuItem('pid');
                                  setOpen(false);
                              }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <IconAdjustmentsHorizontal/>
                            </ListItemIcon>
                            <ListItemText primary='PID'/>
                        </ListItemButton>
                    </ListItem>
                    <ListItem key='logs' disablePadding className='font-creme'
                              onClick={(e) => {
                                  e.preventDefault();
                                  props.onClickMenuItem('logs');
                                  setOpen(false);
                              }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <IconBrandTabler/>
                            </ListItemIcon>
                            <ListItemText primary='Logs'/>
                        </ListItemButton>
                    </ListItem>
                    <ListItem key='config' disablePadding className='font-creme'
                              onClick={(e) => {
                                  e.preventDefault();
                                  props.onClickMenuItem('config');
                                  setOpen(false);
                              }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <IconCpu/>
                            </ListItemIcon>
                            <ListItemText primary='Pico Config'/>
                        </ListItemButton>
                    </ListItem>
                    <ListItem key='about' disablePadding className='font-creme'
                              onClick={(e) => {
                                  e.preventDefault();
                                  props.onClickMenuItem('about');
                                  setOpen(false);
                              }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <IconInfoCircle/>
                            </ListItemIcon>
                            <ListItemText primary='About'/>
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} className='content-container container pt-2'>
                {props.content}
            </div>
        </div>
    );
}

export default CoffeeHubComponent;
