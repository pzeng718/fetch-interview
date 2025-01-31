"use client";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "../../components/LoginForm";
import { Card, Spin, Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";

const { Title } = Typography;
const API_ENDPOINT = "https://frontend-take-home-service.fetch.com";

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export default function MatchPage() {
  const { isAuthenticated, logout } = useAuth();

  const [likedDogs, setLikedDogs] = useState<Dog[]>([]);
  const [matchedDogs, setMatchedDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedLikedDogs = JSON.parse(localStorage.getItem("likedDogs") || "[]");
    setLikedDogs(savedLikedDogs);

    // Retrieve matched dogs from localStorage if available
    const savedMatchedDogs = JSON.parse(localStorage.getItem("matchedDogs") || "[]");
    setMatchedDogs(savedMatchedDogs);

    if (savedLikedDogs.length > 0) {
      // Fetch the dog details from the API based on the liked dogs
      axios.post(`${API_ENDPOINT}/dogs`, savedLikedDogs, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      })
      .then(dogsResp => {
        if (dogsResp.status === 200) {
          setLikedDogs(dogsResp.data);
        }
      })
      .catch((err) => {
        if (err.status === 401) {
          logout();
        }
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;

  const matchDogs = () => {
    axios.post(`${API_ENDPOINT}/dogs/match`, likedDogs.map(dog => dog.id), {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    })
    .then(resp => {
      if(resp.status === 200){
        const matched = likedDogs.filter(dog => resp.data?.match.includes(dog.id));
        setMatchedDogs(matched);

        // Save the matched dogs to localStorage
        localStorage.setItem("matchedDogs", JSON.stringify(matched));
      }
    })
    .catch((err) => {
      if (err.status === 401) {
        logout();
      }
    });
  };

  return (
    isAuthenticated ? 
    <div style={{ maxWidth: "1500px", margin: "auto", marginTop: '30px' }}>
      <Title level={2}>
        <Button type="primary" style={{ marginRight: '15px' }} onClick={() => window.history.back()}>
          <ArrowLeftOutlined />
          Back
        </Button>
        Here are all your favorites:
        <Button type="primary" style={{marginLeft: '10px'}} onClick={matchDogs}>
          Match them!
        </Button>
      </Title>

      {/* Display liked dogs */}
      <div style={{display: 'flex', overflowX: 'scroll', width: '100%'}}>
        {likedDogs.map((dog) => (
          <Card
            key={dog.id}
            style={{margin: '0 10px 0 10px', height: '100%'}}
            hoverable
            cover={<img alt={dog.name} src={dog.img} style={{ width: "100%", minWidth: '300px', objectFit: "cover", paddingRight: '15px', paddingLeft: '15px' }} />}
            title={dog.name}
          >
            <Card.Meta
              description={`Breed: ${dog.breed}, Age: ${dog.age}, Zip: ${dog.zip_code}`}
            />
          </Card>
        ))}
      </div>

      <Title style={{marginTop: '30px'}} level={2}>
        Here are your matches:
      </Title>

      {/* Display matched dogs */}
      <div style={{display: 'flex', overflowX: 'scroll', width: '100%'}}>
        {matchedDogs.map((dog) => (
          <Card
            key={dog.id}
            style={{margin: '0 10px 0 10px', height: '100%'}}
            hoverable
            cover={<img alt={dog.name} src={dog.img} style={{ width: "100%", minWidth: '300px', objectFit: "cover", paddingRight: '15px', paddingLeft: '15px' }} />}
            title={dog.name}
          >
            <Card.Meta
              description={`Breed: ${dog.breed}, Age: ${dog.age}, Zip: ${dog.zip_code}`}
            />
          </Card>
        ))}
      </div>
    </div>
    : <LoginForm />
  );
}
