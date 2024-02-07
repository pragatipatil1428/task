"use client"
import { ref, set, get, update, remove, child , onValue, off,push} from "firebase/database";
import { useState, useEffect, use } from "react";
import FirebaseConfig from "../firebaseConfig/firebaseConfig";

const database = FirebaseConfig();

function FirebaseCrud() {
  let [id, setId] = useState<string | null>(''); // Corrected type definition for id state variable
  let [name, setName] = useState<string>('');
  let [contact, setContact] = useState<string>('');
  let [address, setAddress] = useState<string>('');
  let [customers, setCustomers] = useState<any[]>([]);


  let isNullOrWhiteSpaces = (value: string) => {
            value = value.toString();
        
            return value == null || value.replaceAll(' ', '').length < 1;
          };

  useEffect(() => {
    const dbref = ref(database);
    const customersRef = child(dbref, 'Customer');

    const fetchData = () => {
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const customerList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setCustomers(customerList);
        } else {
          setCustomers([]);
        }
      });
    };

    fetchData();

    return () => {
      // Cleanup subscription
      off(customersRef);
    };
  }, []);

  //inserting data
  let InsertData = () => {
    const dbref = ref(database);
  
    if (
      isNullOrWhiteSpaces(name) ||
      isNullOrWhiteSpaces(contact) ||
      isNullOrWhiteSpaces(address)
    ) {
      alert("Fill all the fields..");
      return;
    }
  
    const customersRef = child(dbref, 'Customer');
  
    const newCustomerRef = push(customersRef); // Generate a new reference with auto-generated ID
    const newCustomerId = newCustomerRef.key; // Get the auto-generated ID
  
    set(newCustomerRef, { // Use the new reference to set the data
      sname: name,
      scontact: contact,
      saddress: address,
    })
      .then(() => {
        setId(newCustomerId); // Set the generated ID to the state
        alert("Customer inserted successfully....");
      })
      .catch((error) => {
        console.log(error);
        alert("There was an error while inserting the customer...");
      });
  };
  
  

  //reseting data
  const handleReset = () => {
    setId('');
    setName('');
    setContact('');
    setAddress('');
  };

  // Updating the data
  let UpdateData = () => {
    const dbref = ref(database);
    //@ts-ignore
    if (isNullOrWhiteSpaces(id)) {
      alert(
        "id is empty, try to select a user first, with the select button"
      );
      return;
    }

    get(child(dbref, 'Customer/' + id))
      .then((snapshot) => {
        if (snapshot.exists()) {
          update(ref(database, 'Customer/' + id), {
            sname: name,
            scontact: contact,
            saddress: address,
          })
            .then(() => {
              alert("customer updated successfully....");
            })
            .catch((error) => {
              console.log(error);
              alert("there was an error while updating the customer...");
            });
        } else {
          alert("error: The customer does not exist");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error data retrieval was unsuccessful...");
      });
  };

  // Deleting the data
  let DeleteData = (customerId: string) => {
    const dbref = ref(database);
  
    if (isNullOrWhiteSpaces(customerId)) {
      alert("ID is required to delete the customer");
      return;
    }
  
    get(child(dbref, 'Customer/' + customerId))
      .then((snapshot) => {
        if (snapshot.exists()) {
          remove(ref(database, 'Customer/' + customerId))
            .then(() => {
              alert("Customer deleted successfully....");
            })
            .catch((error) => {
              console.log(error);
              alert("There was an error while deleting the customer...");
            });
        } else {
          alert("Error: The customer does not exist");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error: Data retrieval was unsuccessful...");
      });
  };

  // Fetching the data
let SelectData = (customerId: string) => {
  if (customerId !== null) {
    const selectedCustomer = customers.find(customer => customer.id === customerId);
    if (selectedCustomer) {
      setId(selectedCustomer.id);
      setName(selectedCustomer.sname);
      setContact(selectedCustomer.scontact);
      setAddress(selectedCustomer.saddress);
    } else {
      alert("No data available for the selected customer");
    }
  } else {
    alert("No data available for the selected customer");
  }
};


  return (
    
    <table className="border-collapse border border-gray-200">
      <tbody>
        <tr>
          <td className="p-4">
            <form className="max-w-md mx-auto bg-white rounded shadow-md" onSubmit={InsertData}>
              <fieldset className="p-4">
                <legend className="text-xl font-bold mb-4">Registration Form</legend>
                {/* <div className="mb-4">
                  <label htmlFor="id" className="block text-sm font-medium text-gray-600">Id :</label>
                  <input type="number" id="id" value={id} onChange={(e) => { setId(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required />
                </div> */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-600">Name :</label>
                  <input type="text" id="name" value={name} onChange={(e) => { setName(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-600">Contact :</label>
                  <input type="tel" id="contact" value={contact} onChange={(e) => { setContact(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required pattern="[0-9]{10}" />
                </div>
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-600">Address :</label>
                  <input type="text" id="address" value={address} onChange={(e) => { setAddress(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required />
                </div>
                <div className="flex space-x-4">
                  <button type="button" onClick={InsertData} className="px-4 py-2 bg-blue-500 text-white rounded-md">Insert</button>&nbsp;
                  <button type="button" onClick={UpdateData} className="px-4 py-2 bg-green-500 text-white rounded-md">Update</button>&nbsp;
                  <button type="button" onClick={handleReset} className="px-4 py-2 bg-blue-500 text-white rounded-md">Reset</button>
                </div>
              </fieldset>
            </form>
          </td>
        </tr>

        
        <tr>
          <th className="px-4 py-2 border border-gray-200">Id</th>
          <th className="px-4 py-2 border border-gray-200">Name</th>
          <th className="px-4 py-2 border border-gray-200">Contact</th>
          <th className="px-4 py-2 border border-gray-200">Address</th>
          <th className="px-4 py-2 border border-gray-200">Actions</th>
        </tr>

        {customers.map(customer => (
          <tr key={customer.id}>
            
            <td className="px-4 py-2 border border-gray-200">{customer.id}</td>
            <td className="px-4 py-2 border border-gray-200">{customer.sname}</td>
            <td className="px-4 py-2 border border-gray-200">{customer.scontact}</td>
            <td className="px-4 py-2 border border-gray-200">{customer.saddress}</td>
            <td className="px-4 py-2 border border-gray-200">
              <button onClick={() => SelectData(customer.id)} className="px-4 py-2 bg-yellow-500 text-white rounded-md">Select</button>&nbsp;
              <button type="button" onClick={() => DeleteData(customer.id)} className="px-4 py-2 bg-red-500 text-white rounded-md">Delete</button>
            </td>
            
          </tr>
        ))}

      </tbody>
    </table>
  );
}

export default FirebaseCrud;