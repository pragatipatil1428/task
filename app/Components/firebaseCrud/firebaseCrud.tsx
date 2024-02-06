"use client";
import { ref, set, get, update, remove, child } from "firebase/database";
import { useState } from "react";
import FirebaseConfig from "../firebaseConfig/firebaseConfig";

const database = FirebaseConfig();

function FirebaseCrud() {
  let [id, setId] = useState<string>('');
  let [name, setName] = useState<string>('');
  let [contact, setContact] = useState<string>('');
  let [address, setAddress] = useState<string>('');

  let isNullOrWhiteSpaces = (value: string) => {
    value = value.toString();

    return value == null || value.replaceAll(' ', '').length < 1;
  };

  // Inserting the data
  let InsertData = () => {
    const dbref = ref(database);

    if (
      isNullOrWhiteSpaces(id) ||
      isNullOrWhiteSpaces(name) ||
      isNullOrWhiteSpaces(contact) ||
      isNullOrWhiteSpaces(address)
    ) {
      alert("Fill all the fields..");
      return;
    }

    get(child(dbref, 'Customer/' + id))
      .then((snapshot) => {
        if (snapshot.exists()) {
          alert("The customer exists with given id, try a different id...");
        } else {
          set(ref(database, 'Customer/' + id), {
            sname: name,
            scontact: contact,
            saddress: address,
          })
            .then(() => {
              alert("customer inserted successfully....");
            })
            .catch((error) => {
              console.log(error);
              alert("there was an error while inserting the customer...");
            });
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error data retrieval was unsuccessful...");
      });
  };

  // Updating the data
  let UpdateData = () => {
    const dbref = ref(database);

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
  let DeleteData = () => {
    const dbref = ref(database);

    if (isNullOrWhiteSpaces(id)) {
      alert("id is required to delete the customer");
      return;
    }

    get(child(dbref, 'Customer/' + id))
      .then((snapshot) => {
        if (snapshot.exists()) {
          remove(ref(database, 'Customer/' + id))
            .then(() => {
              alert("customer deleted successfully....");
            })
            .catch((error) => {
              console.log(error);
              alert("there was an error while deleting the customer...");
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

  // Fetching the data
  let SelectData = () => {
    const dbref = ref(database);

    get(child(dbref, 'Customer/' + id))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setName(snapshot.val().sname);
          setContact(snapshot.val().scontact);
          setAddress(snapshot.val().saddress);
        } else {
          alert("No data available");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error data retrieval was unsuccessful...");
      });
  };

  return (
    <form className="max-w-md mx-auto p-4 bg-white rounded shadow-md" onSubmit={InsertData}>

    <fieldset>

    <legend className="text-xl font-bold mb-4">Registration Form</legend>

    <div className="mb-4">
      <label htmlFor="id" className="block text-sm font-medium text-gray-600">Id :</label>
      <input type="number" id="id" value={id} onChange={(e) => { setId(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required/>
    </div>

    <div className="mb-4">
      <label htmlFor="name" className="block text-sm font-medium text-gray-600">Name :</label>
      <input type="text" id="name" value={name} onChange={(e) => { setName(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required/>
    </div>

    <div className="mb-4">
      <label htmlFor="contact" className="block text-sm font-medium text-gray-600">Contact :</label>
      <input type="tel" id="contact" value={contact} onChange={(e) => { setContact(e.target.value); }} 
      className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required pattern="[0-9]{10}"/>
    </div>

    <div className="mb-4">
      <label htmlFor="address" className="block text-sm font-medium text-gray-600">Address :</label>
      <input type="text" id="address" value={address} onChange={(e) => { setAddress(e.target.value); }} className="mt-1 p-2 w-full border rounded-md" autoComplete="off" required/>
    </div>

    <div className="flex space-x-4">
      <button type="button" onClick={InsertData} className="px-4 py-2 bg-blue-500 text-white rounded-md">Insert Data</button>
      <button type="button" onClick={UpdateData} className="px-4 py-2 bg-green-500 text-white rounded-md">Update Data</button>
      <button type="button" onClick={DeleteData} className="px-4 py-2 bg-red-500 text-white rounded-md">Delete Data</button>
      <button type="button" onClick={SelectData} className="px-4 py-2 bg-yellow-500 text-white rounded-md">Select Data</button>
    </div>

  </fieldset>

  </form>

  );
}

export default FirebaseCrud;