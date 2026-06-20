import React, {createContext, useState, useContext} from 'react';

export const lightPalette = {
    background: '#ffffff',
    text: '#333333',
  };
  
  export const darkPalette = {
    background: '#121212',
    text: '#ffffff',
  };

export const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: any }) => {
    const username = 'Alex';

    return (
        <UserContext.Provider value={username}>
            {children}
        </UserContext.Provider>
    )
}