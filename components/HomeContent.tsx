"use client";
import { useAuth } from "../context/AuthContext";
import { Button, Card, message, List } from "antd";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_ENDPOINT = "https://frontend-take-home-service.fetch.com";

export default function HomeContent() {
  const { logout } = useAuth();

  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<Set<string>>(new Set());

  const router = useRouter();

  useEffect(() => {
    axios.get(`${API_ENDPOINT}/dogs/breeds`, { withCredentials: true })
      .then((resp) => {
        if(resp.status === 200){
          setBreeds(resp.data);
        }
      })
      .catch((err) => {
        if(err.status === 401){
          logout();
        }
      });
  }, []);

  const handleSelectBreed = (breed: string) => {
    // Toggle breed selection
    setSelectedBreeds((prevSelectedBreeds) => {
      const updatedSelectedBreeds = new Set(prevSelectedBreeds);
      if (updatedSelectedBreeds.has(breed)) {
        updatedSelectedBreeds.delete(breed); // Deselect breed if already selected
      } else {
        updatedSelectedBreeds.add(breed); // Select breed if not already selected
      }
      return updatedSelectedBreeds;
    });
  };

  const handleSearch = () => {
    if (selectedBreeds.size === 0) {
      message.error("Please select at least one breed.");
      return;
    }

    console.log("Selected Breeds:", Array.from(selectedBreeds));
    router.push(`/dogs?breeds=${Array.from(selectedBreeds)}`)
  };

  return (
    <Card className="home-card" title={<div className="home-card-title">Welcome! <Button type="primary" style={{width: "100px"}} danger onClick={logout} block>Logout</Button></div>} style={{marginTop: "50px" }}>
      <h4><b>Please select a breed to continue</b></h4>
      <List
        className="home-list"
        bordered
        dataSource={breeds}
        renderItem={(breed) => (
          <List.Item
            onClick={() => handleSelectBreed(breed)}
            style={{ cursor: "pointer", backgroundColor: selectedBreeds.has(breed) ? "#e6f7ff" : "" }}
          >
            {breed}
          </List.Item>
        )}
      />
      <Button
        type="primary"
        onClick={handleSearch}
        disabled={selectedBreeds.size === 0} // Disable if no breeds are selected
        style={{ marginTop: "20px" }}
      >
        Search
      </Button>
    </Card>
  );
}
