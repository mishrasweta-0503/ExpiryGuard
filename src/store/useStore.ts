import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage'


type ExpiryItem = {
    id: string;
    name: string;
    expiryDate: string;
    notificationId?: string;
    quantity: number;
  };

interface StoreState {
    items: ExpiryItem[];
    addItem: (name: string, date: Date) => Promise<void>; //function to add new item
    loadItems: () => Promise<void>; //function to pull saved items out of phone's memory when the app starts
    deleteItem: (id: string) => Promise<void>;
    updateItem: (id:string, newName:string, newExpiryDate:string, newQuantity: number) => Promise<void>;
  }

export const useStore = create<StoreState>((set,get) => ({
    // A. Initial State (The raw variables)
    items: [],
  
    // B. Action 1: Add a new item to the list
    addItem: async (name, date) => {
        //Create the item object
        const newItem = { id: Date.now().toString(), name: name, expiryDate: date.toISOString(),quantity: 1 };
        
        //Create the combined array variable
        const updatedItems = [...get().items, newItem];
    
        // Update the global active state for the UI
        set({ items: updatedItems });
    
        //Convert the array variable to a string and save to the hardware
        const stringifiedArray = JSON.stringify(updatedItems);
        await AsyncStorage.setItem('EXPIRY_ITEMS', stringifiedArray);
    },
  
    // C. Action 2: Load items from the phone hardware on startup
    loadItems: async () => {
        //Read the string from AsyncStorage.
        const receivedItems = await AsyncStorage.getItem('EXPIRY_ITEMS')
        //If it exists, parse it into an array.
        if(receivedItems){
            const parsedItems = JSON.parse(receivedItems);
            //Use the 'set' function to overwrite the 'items' array variable above.
            set({ items: parsedItems });
        }
    },
    deleteItem: async(id) => {
      const filteredItems = get().items.filter((item) => String(item.id) !== String(id));
      set({ items: filteredItems });
      const modifiedFilteredItemsArray = JSON.stringify(filteredItems);
      await AsyncStorage.setItem('EXPIRY_ITEMS', modifiedFilteredItemsArray);
    },
    updateItem: async (id:string, newName:string, newExpiryDate:string, newQuantity: number) => {
      set((state) => {
        const updatedItems = state.items.map((item) => {
          if(item.id === id){
            return {
              ...item,
              name:newName,
              expiryDate: newExpiryDate,
              quantity: newQuantity
            }
          }
          return item;
        })
        AsyncStorage.setItem('EXPIRY_ITEMS', JSON.stringify(updatedItems));
        return { items: updatedItems };
      })
    },

  }));