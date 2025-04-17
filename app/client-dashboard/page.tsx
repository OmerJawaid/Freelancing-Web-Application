import React from 'react';
import styles from './client-dashboard.module.css';

interface Gig {
  id: number;
  title: string;
  description: string;
  price: number;
  freelancer: {
    name: string;
    rating: number;
  };
  category: string;
}

export default function ClientDashboard() {
  // This would be fetched from your API in a real implementation
  const gigs: Gig[] = [
    {
      id: 1,
      title: "Professional Web Development",
      description: "Full-stack web development using modern technologies",
      price: 500,
      freelancer: {
        name: "John Doe",
        rating: 4.8
      },
      category: "Web Development"
    },
    {
      id: 2,
      title: "Logo Design & Branding",
      description: "Creative and unique logo design with branding guidelines",
      price: 250,
      freelancer: {
        name: "Jane Smith",
        rating: 4.9
      },
      category: "Design"
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome to Your Dashboard</h1>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search for services..." />
          <button>Search</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.filters}>
          <h2>Filters</h2>
          <div className={styles.filterGroup}>
            <h3>Categories</h3>
            <label><input type="checkbox" /> Web Development</label>
            <label><input type="checkbox" /> Design</label>
            <label><input type="checkbox" /> Writing</label>
            <label><input type="checkbox" /> Marketing</label>
          </div>
          <div className={styles.filterGroup}>
            <h3>Price Range</h3>
            <input type="range" min="0" max="1000" />
            <div className={styles.priceInputs}>
              <input type="number" placeholder="Min" />
              <input type="number" placeholder="Max" />
            </div>
          </div>
        </div>

        <div className={styles.gigGrid}>
          {gigs.map((gig) => (
            <div key={gig.id} className={styles.gigCard}>
              <div className={styles.gigImage}>
                {/* Placeholder for gig image */}
                <div className={styles.imagePlaceholder}></div>
              </div>
              <div className={styles.gigContent}>
                <h3>{gig.title}</h3>
                <p>{gig.description}</p>
                <div className={styles.freelancerInfo}>
                  <span>{gig.freelancer.name}</span>
                  <span>⭐ {gig.freelancer.rating}</span>
                </div>
                <div className={styles.gigFooter}>
                  <span className={styles.price}>${gig.price}</span>
                  <button className={styles.viewButton}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 