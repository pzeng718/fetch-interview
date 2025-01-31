"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeftOutlined, LikeOutlined, LikeFilled } from "@ant-design/icons";

import { Card, List, Spin, Typography, Button, Pagination, Select } from "antd";
import LoginForm from "@/components/LoginForm";
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

export default function DogsPage() {
  const { isAuthenticated, logout } = useAuth();

  const searchParams = useSearchParams();
  const breed = searchParams.get("breeds");
  const [sort, setSort] = useState<string>('asc');
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [breedTotal, setBreedTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentPageSize, setCurrentPageSize] = useState<number>(25);
  const [likedDogs, setLikedDogs] = useState<Set<string>>(new Set());

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !breed) return;

    // Check liked dogs from localStorage (if available)
    const savedLikedDogs = JSON.parse(localStorage.getItem("likedDogs") || "[]");
    setLikedDogs(new Set(savedLikedDogs));

    getCurrentPageDogDetails(currentPage, currentPageSize);
  }, [breed, isAuthenticated]);

  const getCurrentPageDogDetails = (start: number, pageSize: number) => {
    const breedsParam = breed?.split(',').map(b => `breeds=${b}`).join('&');
    axios.get(`${API_ENDPOINT}/dogs/search?${breedsParam}&size=${pageSize}&from=${start}&sort=breed:${sort}`, { withCredentials: true })
    .then((resp) => {
      if(resp.status === 200){
        setBreedTotal(resp.data.total);

        axios.post(`${API_ENDPOINT}/dogs`, resp.data.resultIds, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        })
        .then(dogsResp => {
          if(dogsResp.status === 200){
            setDogs(dogsResp.data);
          }
        })
      }
    })
    .catch((err) => {
      if(err.status === 401){
        logout();
      }
    });
  };

  const handlePagesizeChange = (page: number, pageSize: number) => {
    getCurrentPageDogDetails((page - 1) * pageSize, pageSize);
    setCurrentPage(page - 1);
    setCurrentPageSize(pageSize);
  };

  const handleLikeToggle = (dogId: string) => {
    const updatedLikedDogs = new Set(likedDogs);
    if (updatedLikedDogs.has(dogId)) {
      updatedLikedDogs.delete(dogId);
    } else {
      updatedLikedDogs.add(dogId);
    }

    setLikedDogs(updatedLikedDogs);
    localStorage.setItem("likedDogs", JSON.stringify(Array.from(updatedLikedDogs))); // Persist in localStorage
  };

  return (
    isAuthenticated ? 
    <div style={{maxWidth: "1500px", margin: "auto", marginTop: '30px' }}>
      <Title level={2}>
        <Button type="primary" style={{marginRight: '15px'}} onClick={() => window.history.back()}>
          <ArrowLeftOutlined />
          Back
        </Button>
        {breed ? `Dogs of Breed: ${breed}` : "Select a Breed"}
        <span style={{display: 'inline-block', marginLeft: '50px'}}>
          Sort: <Select defaultValue={'asc'} onChange={(sort) => setSort(sort)} options={[{ value: 'asc', label: 'asc'}, { value: 'desc', label: 'desc'}]} />
          <Button 
            type="primary" 
            style={{marginLeft: '10px'}} 
            onClick={() => getCurrentPageDogDetails(currentPage * currentPageSize, currentPageSize)}
          >
            Resort
          </Button>
        </span>
        <Button
          style={{position: 'absolute', right: 500, top: 45}}
          type="primary"
          onClick={() => router.push("/match")}
        >
          Go to match
        </Button>
      </Title>
      <List
        grid={{ gutter: 16, column: 5 }}
        dataSource={dogs}
        renderItem={(dog) => (
          <List.Item>
            <Card
              hoverable
              cover={<img src={dog.img} alt={dog.name} style={{ width: "100%", objectFit: "cover" }} />}
            >
              <Card.Meta 
                title={
                <span>
                  {dog.name} age: {dog.age}
                  <Button
                    style={{}}
                    type="text"
                    icon={likedDogs.has(dog.id) ? <LikeFilled style={{ color: 'red' }} /> : <LikeOutlined />}
                    onClick={() => handleLikeToggle(dog.id)}
                  >
                    Favorite
                  </Button>
                </span>
                } 
                description={`Breed: ${dog.breed}, zip: ${dog.zip_code}`} 
              />
            </Card>
          </List.Item>
        )}
      />
      <div style={{display: 'flex', justifyContent: 'center', alignContent: 'center'}}>
        <Pagination defaultCurrent={1} defaultPageSize={25} total={breedTotal} showSizeChanger={false} onChange={handlePagesizeChange} />
      </div>
    </div>
    : <LoginForm />
  );
}
