"use client"
import React, { useState, useEffect } from "react";
import { ref, set, get, update, remove, child, onValue, off, push } from "firebase/database";
import FirebaseConfig from "../firebaseConfig/firebaseConfig";

const database = FirebaseConfig();

function FirebaseCrud() {
  const [id, setId] = useState<string | null>('');
  const [name, setName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [isDataInserted, setIsDataInserted] = useState<boolean>(false); // New state to track data insertion

  const isNullOrWhiteSpaces = (value: string) => {
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

  const InsertData = () => {
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

    const newCustomerRef = push(customersRef); 
    const newCustomerId = newCustomerRef.key; 

    set(newCustomerRef, {
      sname: name,
      scontact: contact,
      saddress: address,
    })
      .then(() => {
        setId(newCustomerId); 
        setIsDataInserted(true); // Set the flag to true after data insertion
        alert("Customer inserted successfully....");
      })
      .catch((error) => {
        console.log(error);
        alert("There was an error while inserting the customer...");
      });
  };

  const handleReset = () => {
    setId('');
    setName('');
    setContact('');
    setAddress('');
    setIsDataInserted(false); // Reset the flag when resetting the form
  };

  const UpdateData = () => {
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

  const DeleteData = (customerId: string) => {
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

  const SelectData = (customerId: string) => {
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
                  {!isDataInserted && <button type="button" onClick={InsertData} className="px-4 py-2 bg-blue-500 text-white rounded-md">Insert</button>}
                  {isDataInserted && <button type="button" onClick={UpdateData} className="px-4 py-2 bg-green-500 text-white rounded-md">Update</button>}
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
              <button onClick={() => SelectData(customer.id)} className="px-4 py-2 bg-yellow-500 text-white rounded-md">Select</button> &nbsp;
              <button type="button" onClick={() => DeleteData(customer.id)} className="px-4 py-2 bg-red-500 text-white rounded-md">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  
}

export default FirebaseCrud;




// import React, { useState, useEffect } from "react";
// import { ref, set, get, update, remove, child, onValue, off, push, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/database";
// import FirebaseConfig from "../firebaseConfig/firebaseConfig";
// import { getAuth, onAuthStateChanged } from "firebase/auth";

// const database = FirebaseConfig();
// const auth = getAuth();

// function FirebaseCrud() {
//   const [id, setId] = useState<string | null>('');
//   const [name, setName] = useState<string>('');
//   const [contact, setContact] = useState<string>('');
//   const [address, setAddress] = useState<string>('');
//   const [customers, setCustomers] = useState<any[]>([]);
//   const [isDataInserted, setIsDataInserted] = useState<boolean>(false); // New state to track data insertion
//   const [user, setUser] = useState<any>(null);
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');


//   const isNullOrWhiteSpaces = (value: string) => {
//         value = value.toString();
//         return value == null || value.replaceAll(' ', '').length < 1;
//       };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUser(user);
//       } else {
//         setUser(null);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   // Authentication functions
//   const handleSignUp = async () => {
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       // If successful, user state will be updated through onAuthStateChanged
//     } catch (error) {
//       console.error(error);
//       alert("Error signing up: " + error.message);
//     }
//   };

//   const handleSignIn = async () => {
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       // If successful, user state will be updated through onAuthStateChanged
//     } catch (error) {
//       console.error(error);
//       alert("Error signing in: " + error.message);
//     }
//   };

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//       // If successful, user state will be updated through onAuthStateChanged
//     } catch (error) {
//       console.error(error);
//       alert("Error signing out: " + error.message);
//     }
//   };

//   // CRUD functions
//   // (Remainder of CRUD functions remain unchanged)
//   const InsertData = () => {
//         const dbref = ref(database);
    
//         if (
//           isNullOrWhiteSpaces(name) ||
//           isNullOrWhiteSpaces(contact) ||
//           isNullOrWhiteSpaces(address)
//         ) {
//           alert("Fill all the fields..");
//           return;
//         }
//     // 
//         const customersRef = child(dbref, 'Customer');
    
//         const newCustomerRef = push(customersRef); 
//         const newCustomerId = newCustomerRef.key; 
    
//         set(newCustomerRef, {
//           sname: name,
//           scontact: contact,
//           saddress: address,
//         })
//           .then(() => {
//             setId(newCustomerId); 
//             setIsDataInserted(true); // Set the flag to true after data insertion
//             alert("Customer inserted successfully....");
//           })
//           .catch((error) => {
//             console.log(error);
//             alert("There was an error while inserting the customer...");
//           });
//       };
    
//       const handleReset = () => {
//         setId('');
//         setName('');
//         setContact('');
//         setAddress('');
//         setIsDataInserted(false); // Reset the flag when resetting the form
//       };
    
//       const UpdateData = () => {
//         const dbref = ref(database);
//         //@ts-ignore
//         if (isNullOrWhiteSpaces(id)) {
//           alert(
//             "id is empty, try to select a user first, with the select button"
//           );
//           return;
//         }
    
//         get(child(dbref, 'Customer/' + id))
//           .then((snapshot) => {
//             if (snapshot.exists()) {
//               update(ref(database, 'Customer/' + id), {
//                 sname: name,
//                 scontact: contact,
//                 saddress: address,
//               })
//                 .then(() => {
//                   alert("customer updated successfully....");
//                 })
//                 .catch((error) => {
//                   console.log(error);
//                   alert("there was an error while updating the customer...");
//                 });
//             } else {
//               alert("error: The customer does not exist");
//             }
//           })
//           .catch((error) => {
//             console.log(error);
//             alert("Error data retrieval was unsuccessful...");
//           });
//       };
    
//       const DeleteData = (customerId: string) => {
//         const dbref = ref(database);
    
//         if (isNullOrWhiteSpaces(customerId)) {
//           alert("ID is required to delete the customer");
//           return;
//         }
    
//         get(child(dbref, 'Customer/' + customerId))
//           .then((snapshot) => {
//             if (snapshot.exists()) {
//               remove(ref(database, 'Customer/' + customerId))
//                 .then(() => {
//                   alert("Customer deleted successfully....");
//                 })
//                 .catch((error) => {
//                   console.log(error);
//                   alert("There was an error while deleting the customer...");
//                 });
//             } else {
//               alert("Error: The customer does not exist");
//             }
//           })
//           .catch((error) => {
//             console.log(error);
//             alert("Error: Data retrieval was unsuccessful...");
//           });
//       };
    
//       const SelectData = (customerId: string) => {
//         if (customerId !== null) {
//           const selectedCustomer = customers.find(customer => customer.id === customerId);
//           if (selectedCustomer) {
//             setId(selectedCustomer.id);
//             setName(selectedCustomer.sname);
//             setContact(selectedCustomer.scontact);
//             setAddress(selectedCustomer.saddress);
//           } else {
//             alert("No data available for the selected customer");
//           }
//         } else {
//           alert("No data available for the selected customer");
//         }
//       };
    
    

//   return (
//     <>
//       {user ? (
//         <button onClick={handleSignOut}>Sign Out</button>
//       ) : (
//         <>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button onClick={handleSignIn}>Sign In</button>
//           <button onClick={handleSignUp}>Sign Up</button>
//         </>
//       )}
//       {/* Existing CRUD component */}



//       <table className="border-collapse border border-gray-200">    <tbody>
//         <tr>
//           <td className="p-4">
//             <form className="max-w-md mx-auto bg-white rounded shadow-md" onSubmit={InsertData}>
//               <fieldset className="p-4">
//                 <legend className="text-xl font-bold mb-4">Registration Form</legend>
//                 <div className="mb-4">
//                   <label htmlFor="name" className="block text-sm font-medium text-gray-600">Name :</label>
//                   <input type="text" id="name" value={name} onChange={(e) => { setName(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required />
//                 </div>
//                 <div className="mb-4">
//                   <label htmlFor="contact" className="block text-sm font-medium text-gray-600">Contact :</label>
//                   <input type="tel" id="contact" value={contact} onChange={(e) => { setContact(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required pattern="[0-9]{10}" />
//                 </div>
//                 <div className="mb-4">
//                   <label htmlFor="address" className="block text-sm font-medium text-gray-600">Address :</label>
//                   <input type="text" id="address" value={address} onChange={(e) => { setAddress(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required />
//                 </div>
//                 <div className="flex space-x-4">
//                   {!isDataInserted && <button type="button" onClick={InsertData} className="px-4 py-2 bg-blue-500 text-white rounded-md">Insert</button>}
//                   <button type="button" onClick={UpdateData} className="px-4 py-2 bg-green-500 text-white rounded-md">Update</button>
//                   <button type="button" onClick={handleReset} className="px-4 py-2 bg-blue-500 text-white rounded-md">Reset</button>
//                 </div>
//               </fieldset>
//             </form>
//           </td>
//         </tr>
//         <tr>
//           <th className="px-4 py-2 border border-gray-200">Id</th>
//           <th className="px-4 py-2 border border-gray-200">Name</th>
//           <th className="px-4 py-2 border border-gray-200">Contact</th>
//           <th className="px-4 py-2 border border-gray-200">Address</th>
//           <th className="px-4 py-2 border border-gray-200">Actions</th>
//         </tr>
//              {customers.map(customer => (       
//              <tr key={customer.id}>
//             <td className="px-4 py-2 border border-gray-200">{customer.id}</td>
//             <td className="px-4 py-2 border border-gray-200">{customer.sname}</td>
//             <td className="px-4 py-2 border border-gray-200">{customer.scontact}</td>
//             <td className="px-4 py-2 border border-gray-200">{customer.saddress}</td>
//             <td className="px-4 py-2 border border-gray-200">
//               <button onClick={() => SelectData(customer.id)} className="px-4 py-2 bg-yellow-500 text-white rounded-md">Select</button> &nbsp;
//               <button type="button" onClick={() => DeleteData(customer.id)} className="px-4 py-2 bg-red-500 text-white rounded-md">Delete</button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//     </>
//   );
// }

// export default FirebaseCrud;