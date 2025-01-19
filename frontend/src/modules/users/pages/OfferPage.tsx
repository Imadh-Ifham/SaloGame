import React from "react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layout/HomeLayout";
import { motion } from "framer-motion";

const OfferCategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "TIME-BASED Offers",
      path: "/offers/time-based",
      description: "Limited-time discounts and seasonal promotions",
    },
    {
      name: "MEMBERSHIP Offers",
      path: "/offers/membership-based",
      description: "Exclusive deals for different membership tiers",
    },
    {
      name: "GENERAL Offers",
      path: "/offers/general",
      description: "Special offers available to all users",
    },
    {
      name: "SEASONAL Offers",
      path: "/offers/exclusive",
      description: "Premium deals for VIP members",
    },
  ];

  return (
    <HomeLayout>
      <div className="container mx-auto px-4 py-16 my-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-primary mb-16 font-press text-center"
        >
          Explore Offer Categories
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div
                className="group relative min-h-[200px] w-full bg-background/80 dark:bg-background-dark/80 
                rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 
                cursor-pointer overflow-hidden backdrop-blur-sm border border-primary/10
                hover:border-primary/30 flex flex-col items-center justify-center p-6 mb-4"
              >
                {/* Background Image with Gradient 
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30
                    transition-all duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(/path/to/${category.name
                      .toLowerCase()
                      .replace(/ /g, "-")}.jpg)`,
                  }}
                />*/}

                {/* Content Container */}
                <div className="relative z-10 text-center">
                  <h3
                    className="text-2xl font-semibold font-press text-primary mb-3
                    group-hover:text-primary-dark transition-colors duration-300"
                  >
                    {category.name}
                  </h3>
                  <p
                    className="text-text-secondary dark:text-gray-300 font-poppins text-sm
                    opacity-0 group-hover:opacity-100 transition-all duration-300
                    transform translate-y-4 group-hover:translate-y-0"
                  >
                    {category.description}
                  </p>
                </div>

                {/* Interactive Border Effect */}
                <div
                  className="absolute inset-0 border-2 border-transparent rounded-2xl
                  group-hover:border-primary/50 transition-all duration-500"
                />
              </div>

              {/* Navigation Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => navigate(category.path)}
                className="px-6 py-2 bg-primary/90 hover:bg-primary text-white rounded-lg
                  shadow-lg hover:shadow-xl transition-all duration-300 transform
                  hover:-translate-y-1 font-poppins text-sm font-medium
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  dark:focus:ring-offset-gray-900"
              >
                Explore
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </HomeLayout>
  );
};

export default OfferCategoriesPage;
