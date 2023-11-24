import React, { useEffect } from "react";
import { ChakraProvider, Box, Button } from "@chakra-ui/react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import "./App.css";

const TOKEN = process.env.REACT_APP_AIRTABLE_TOKEN;

const App = () => {
  const [marketer, setMarketer] = React.useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const marketer = urlParams.get("m");
    if (marketer) setMarketer(marketer);
  }, []);

  const schema = {
    title: "",
    type: "object",
    properties: {
      option: {
        type: "string",
        title: "Choose your option",
        enum: ["one-plate", "two-litres"],
        enumNames: [
          "One plate with 2 piece chicken (£7)",
          "2 Litres with 12 piece chicken (£32)",
        ],
      },
      quantity: {
        type: "number",
        title: "How many?",
        minimum: 1,
      },
      name: {
        type: "string",
        title: "Your name",
        pattern: "^[A-Za-z ]+$",
      },
      phone: {
        type: "number",
        title: "Your phone number",
      },
      pickup: {
        type: "string",
        title: "Preferred pickup location in MDX",
      },
    },
    required: ["option", "quantity", "name", "phone", "pickup"],
  };

  const uiSchema = {
    option: {
      classNames: "form-field-title",
    },
    quantity: {
      classNames: "form-field-title",
    },
    name: {
      "ui:autofocus": true,
      classNames: "form-field-title",
    },
    phone: {
      classNames: "form-field-title",
      "ui:placeholder": "e.g. 07712345678",
    },
    pickup: {
      classNames: "form-field-title",
      "ui:placeholder": "e.g. MDX House, Sheppard Library (Basement), etc.",
    },
  };

  const addData = async (data) => {
    console.log(data);
    const isSuccessful = await fetch(
      "https://api.airtable.com/v0/appBGc2YLVRZAuFGU/Requests",
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          records: [
            {
              fields: {
                ...data,
              },
            },
          ],
        }),
      }
    ).then((res) => res.ok);

    return isSuccessful;
  };

  const onSubmit = async ({ formData }, e) => {
    const { option, quantity, name, phone, pickup } = formData;

    const total = option === "one-plate" ? quantity * 7 : quantity * 32;

    if (total > 500) {
      alert("Sorry, we cannot process orders over £500");
      return;
    }

    const fullname = name.split(" ").join("_");

    const url = `https://monzo.me/davidobidu/${total}.00?d=DONT%20EDIT%20THIS____JRICE%20order%20from%20${fullname}%20${phone}`;

    const tableData = {
      "Payment Status": "Pending",
      "Delivery Status": "Pending",
      Name: name,
      Phone: phone,
      Pickup: pickup,
      Quantity: quantity,
      Option: option,
      Date: new Date().toISOString(),
      Total: total,
    };

    if (marketer) tableData["Marketer"] = marketer;

    const isSuccessful = await addData(tableData);

    if (isSuccessful) window.open(url, "_blank");
    else
      alert(
        "Something went wrong. Please try again. or contact us: +447721494822"
      );
  };

  return (
    <ChakraProvider>
      <Box p={4} className="align-all-center">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          onSubmit={onSubmit}
          validator={validator}
        >
          <Button type="submit" colorScheme="green" mt={4}>
            Submit
          </Button>
        </Form>
      </Box>
    </ChakraProvider>
  );
};

export default App;
