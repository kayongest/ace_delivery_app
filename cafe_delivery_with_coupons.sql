-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 11, 2026 at 09:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cafe_delivery`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `label` varchar(50) DEFAULT 'Home',
  `address_text` text NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percent','flat') NOT NULL,
  `value` int(11) NOT NULL,
  `min_order_amount` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `type`, `value`, `min_order_amount`, `active`, `created_at`) VALUES
(1, 'WELCOME TO ACE', 'percent', 20, 5000, 1, '2026-07-11 18:41:30'),
(4, 'TESTCOUPON', 'percent', 10, 1000, 1, '2026-07-11 18:45:46'),
(8, 'THURS_SPECIAL', 'flat', 1000, 15000, 0, '2026-07-11 18:49:46');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `menu_id`, `created_at`) VALUES
(1, 5, 101, '2026-06-20 20:35:33'),
(2, 5, 102, '2026-06-20 20:35:35'),
(3, 5, 103, '2026-06-20 20:35:36'),
(4, 5, 1001, '2026-06-20 20:35:39'),
(5, 11, 102, '2026-06-24 10:43:23'),
(6, 11, 101, '2026-06-24 10:43:26'),
(7, 11, 1002, '2026-06-24 10:54:29'),
(8, 11, 1001, '2026-06-24 10:54:30'),
(9, 11, 1003, '2026-06-24 10:54:31'),
(10, 11, 1302, '2026-06-24 12:27:21'),
(11, 11, 1301, '2026-06-24 12:27:22'),
(12, 11, 1303, '2026-06-24 12:27:24'),
(13, 11, 1402, '2026-06-24 12:27:27'),
(14, 11, 1403, '2026-06-24 12:27:28'),
(15, 1, 101, '2026-07-06 06:12:27'),
(16, 22, 1001, '2026-07-11 16:42:51');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id`, `name`, `price`, `category`, `description`, `image`, `created_at`) VALUES
(101, 'Mashed Cheese Potatoes', 0, 'sides', 'Coated and fried', 'images/menu_item_6a353b7107782.png', '2026-06-18 07:40:51'),
(102, 'Beef Stir Fry', 5000, 'sides', 'Beef meat, onions, green pepper, served with chips', 'images/menu_item_6a35449c5e50a.png', '2026-06-18 07:40:51'),
(103, 'French Fries', 3000, 'sides', 'Chips with salad', 'images/menu_item_6a369ce923204.jpg', '2026-06-18 07:40:51'),
(104, 'Fried Chicken Wings', 5000, 'sides', 'Served with chips or salad', 'images/menu_item_6a369d6289446.jpg', '2026-06-18 07:40:51'),
(105, 'Chicken Leg', 7000, 'sides', 'Served with chips or salad', 'images/menu_item_6a369e799bb47.jpg', '2026-06-18 07:40:52'),
(106, 'Chicken Brochette', 4000, 'sides', 'Chicken Brochette', 'images/menu_item_6a369fbc7acf6.jpg', '2026-06-18 07:40:52'),
(107, 'Beef Brochette', 3000, 'sides', 'Beef Brochette', 'images/menu_item_6a4fd4db12cb1.jpg', '2026-06-18 07:40:52'),
(201, 'Meat ball', 1000, 'sides', 'Display item', 'images/menu_item_6a4fd82cb2b1b.jpg', '2026-06-18 07:40:52'),
(202, 'Samosa (beef)', 1000, 'sides', 'Beef Samosa Recipe – Easy, Crispy, and Packed with Flavor ', 'images/menu_item_6a4fd8b4ae62b.png', '2026-06-18 07:40:52'),
(203, 'Chapati', 500, 'sides', 'Display item', 'images/menu_item_6a4fd94e6c890.jpg', '2026-06-18 07:40:52'),
(204, 'Potato samosa', 300, 'sides', 'Display item', 'images/menu_item_6a4fda91c0a7d.jpg', '2026-06-18 07:40:52'),
(301, 'Ace Burger', 7000, 'burgers', 'Lettuce, tomato, onions, sausage, beef, fried egg, cucumber', 'images/menu_item_6a4fda9e7c182.jpg', '2026-06-18 07:40:52'),
(302, 'Chicken Burger', 6000, 'burgers', 'Tomato, chicken, onions, lettuce (served with chips), cheese', 'images/menu_item_6a4fdacc3bd68.jpg', '2026-06-18 07:40:52'),
(303, 'Beef Burger', 5000, 'burgers', 'Tomato, onions, beef, lettuce (served with chips), cheese', 'images/menu_item_6a354423b5577.png', '2026-06-18 07:40:52'),
(304, 'Giant Burger', 7000, 'burgers', 'Tomato, onions, lettuce, double meat, cheese', 'images/menu_item_6a4fdafc57c3e.jpg', '2026-06-18 07:40:52'),
(401, 'AB mango', 5000, 'smoothies', 'Smoothie', 'images/menu_item_6a4fde172ab6a.jpg', '2026-06-18 07:40:52'),
(402, 'AB hills', 5500, 'smoothies', 'Smoothie', 'images/neon_iced_latte.png', '2026-06-18 07:40:52'),
(403, 'AB blend', 5000, 'smoothies', 'Smoothie', 'images/neon_iced_latte.png', '2026-06-18 07:40:52'),
(404, 'Mango banana', 4000, 'smoothies', 'Smoothie', 'images/neon_iced_latte.png', '2026-06-18 07:40:52'),
(405, 'Banana berries', 4500, 'smoothies', 'Smoothie', 'images/neon_iced_latte.png', '2026-06-18 07:40:52'),
(406, 'Fanta', 1500, 'smoothies', '', 'images/neon_iced_latte.png', '2026-06-18 07:40:52'),
(407, 'Mineral water 1.5L', 1500, 'smoothies', '', 'images/neon_iced_latte.png', '2026-06-18 07:40:52'),
(408, 'Mineral water 500ML', 1000, 'smoothies', '', 'images/neon_iced_latte.png', '2026-06-18 07:40:52'),
(409, 'Juice', 1500, 'smoothies', '', 'images/neon_iced_latte.png', '2026-06-18 07:40:52'),
(501, 'Turmeric shot (bottle)', 10000, 'shots', 'Bottle refill is just 5k', 'images/neon_iced_latte.png', '2026-06-18 07:40:52'),
(502, 'Ginger shot (bottle)', 10000, 'shots', 'Bottle refill is just 5k', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(503, 'Green detox shot (bottle)', 10000, 'shots', 'Bottle refill is just 5k', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(504, 'Chosen shot (bottle)', 10000, 'shots', 'Bottle refill is just 5k', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(601, 'Mango', 3000, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(602, 'Passion', 2500, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(603, 'Papaya', 3000, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(604, 'Orange', 3000, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(605, 'Pineapple', 2500, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(606, 'Tree-tomato', 3000, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(607, 'Lemon', 2500, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(608, 'Cocktail juice', 5000, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(609, 'Detox juice', 5000, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(610, 'Apple', 2500, 'smoothies', 'Fresh juice', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(701, 'Vanilla shakes', 4000, 'shakes', 'Milk shake', 'images/cyber_croissant.png', '2026-06-18 07:40:53'),
(702, 'Strawberry Shakes', 4000, 'shakes', 'Milk shake', 'images/cyber_croissant.png', '2026-06-18 07:40:53'),
(703, 'Chocolate shakes', 4000, 'shakes', 'Milk shake', 'images/cyber_croissant.png', '2026-06-18 07:40:53'),
(704, 'Nutella shake', 6000, 'shakes', 'Milk shake', 'images/cyber_croissant.png', '2026-06-18 07:40:53'),
(801, 'Ice Shaken', 4000, 'iced', 'Iced drink', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(802, 'Iced Caramel', 4000, 'iced', 'Iced drink', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(803, 'Iced Mocha', 4000, 'iced', 'Iced drink', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(804, 'Iced Latte', 3000, 'iced', 'Iced drink', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(805, 'Iced Tea', 2500, 'iced', 'Iced drink', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(806, 'Iced Americano', 2500, 'iced', 'Iced drink', 'images/neon_iced_latte.png', '2026-06-18 07:40:53'),
(807, 'Iced Espresso', 2500, 'iced', 'Iced drink', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(808, 'Iced Chocolate', 4000, 'iced', 'Iced drink', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(809, 'Iced Hibiscus', 3000, 'iced', 'Iced drink', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(901, 'Vanilla Ice Cream', 2000, 'shakes', 'Ice Cream', 'images/cyber_croissant.png', '2026-06-18 07:40:54'),
(902, 'Strawberry Ice Cream', 2000, 'shakes', 'Ice Cream', 'images/cyber_croissant.png', '2026-06-18 07:40:54'),
(903, 'Chocolate Ice Cream', 2000, 'shakes', 'Ice Cream', 'images/cyber_croissant.png', '2026-06-18 07:40:54'),
(1001, 'Cappuccino', 2500, 'coffee', 'Coffee', 'images/menu_item_6a354e6ed8fc3.png', '2026-06-18 07:40:54'),
(1002, 'Cafe Latte', 2500, 'coffee', 'Coffee', 'images/menu_item_6a4fd39da951b.jpg', '2026-06-18 07:40:54'),
(1003, 'Cortado', 2500, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1004, 'Flat white', 2500, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1005, 'Caramel latte', 3000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1006, 'Vanilla latte', 3000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1007, 'Cafe mocha', 3000, 'coffee', 'Coffee', 'images/menu_item_6a4fd3fb87ce9.jpg', '2026-06-18 07:40:54'),
(1008, 'Hot chocolate', 3000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1009, 'Cafe au lait', 2500, 'coffee', 'Coffee', 'images/menu_item_6a4fd43487d24.jpg', '2026-06-18 07:40:54'),
(1010, 'Americano', 2000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1011, 'Regular coffee', 2000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1012, 'Espresso', 2000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1013, 'Lungo', 2000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1014, 'Ristretto', 2000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1015, 'Espresso macchiato', 2000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1016, 'Hot milk', 2000, 'coffee', 'Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1101, 'V60', 3000, 'coffee', 'Drip Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1102, 'Chemex', 3000, 'coffee', 'Drip Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1103, 'Aeropress', 3000, 'coffee', 'Drip Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1104, 'French press', 3000, 'coffee', 'Drip Coffee', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1201, 'African tea', 2500, 'tea', 'Tea', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(1202, 'African coffee', 2500, 'tea', 'Tea', 'images/void_espresso.png', '2026-06-18 07:40:54'),
(1203, 'Russian tea', 2500, 'tea', 'Tea', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(1204, 'Spiced tea', 3000, 'tea', 'Tea', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(1205, 'Minty tea', 2000, 'tea', 'Tea', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(1206, 'Black tea', 1500, 'tea', 'Tea', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(1207, 'Vanilla tea', 2000, 'tea', 'Tea', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(1208, 'Hibiscus tea', 2000, 'tea', 'Tea', 'images/neon_iced_latte.png', '2026-06-18 07:40:54'),
(1209, 'Green tea', 2000, 'tea', 'Tea', 'images/neon_iced_latte.png', '2026-06-18 07:40:55'),
(1301, 'Ace Pizza', 10000, 'pizza', 'Onions, green pepper, tomato, sausage, ham, meat, egg, Cheese', 'images/ace_cafe.png', '2026-06-18 07:40:55'),
(1302, 'Margherita Pizza', 6000, 'pizza', 'Cheese, tomato, oregano', 'images/ace_cafe.png', '2026-06-18 07:40:55'),
(1303, 'Meat Lovers Pizza', 8000, 'pizza', 'Onions, chicken, meat, sausage, tomato, cheese, green pepper', 'images/ace_cafe.png', '2026-06-18 07:40:55'),
(1401, 'Spanish Omelette', 3000, 'omelettes', 'Green pepper, onions, beaten egg, tomato', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(1402, 'Special Omelette', 4000, 'omelettes', 'chips, onions, tomato, beaten eggs, meat, green pepper', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(1403, 'Meat Omelette', 5000, 'omelettes', 'onions, meat/sausage, green pepper, tomato, eggs', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(1404, 'Capati Omelette', 2000, 'omelettes', 'onions, tomatoes, eggs, capati', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(1501, 'Vegetable Sandwich', 4000, 'sandwiches', 'onions, tomato, green pepper, avocado, lettuce served with chips', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(1502, 'Croque Madame', 5500, 'sandwiches', 'Ham, cheese, egg, toasted bread with chips', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(1503, 'Croque Monsieur', 5000, 'sandwiches', 'Ham, cheese, toasted bread with chips', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(1504, 'Ace Sandwich', 6000, 'sandwiches', 'Meat, onions, green pepper, tomato, ham', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(1601, 'Chicken Wraps', 5000, 'sandwiches', 'Onions, tomato, chicken, carrots (served with chips)', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(1602, 'Beef Wraps', 5000, 'sandwiches', 'Onions, tomato, beef, green pepper, carrots (served with chips)', 'images/cyber_croissant.png', '2026-06-18 07:40:55'),
(9001, 'Avocado', 500, 'extras', 'Fresh avocado side', 'images/menu_item_6a528169ecef2.jpg', '2026-07-11 17:11:49'),
(9002, 'Kachumbari', 0, 'extras', 'Fresh tomato and onion salad', 'images/menu_item_6a5281a6bc2db.jpg', '2026-07-11 17:11:49'),
(9003, 'Mayonnaise', 0, 'extras', 'Creamy mayonnaise portion', 'images/menu_item_6a52821c70a83.png', '2026-07-11 17:11:49'),
(9004, 'Ketchup', 0, 'extras', 'Classic tomato ketchup portion', 'images/menu_item_6a52825a283ed.jpg', '2026-07-11 17:11:49'),
(9005, 'PiliPili', 0, 'extras', 'Spice', 'images/menu_item_6a5282a72dc73.jpeg', '2026-07-11 17:50:43');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `total_amount` int(11) NOT NULL,
  `status` enum('pending','preparing','out_for_delivery','complete_awaiting_pickup','delivered','cancelled') DEFAULT 'pending',
  `payment_method` enum('cod','card','momo','airtel','mobile_money') DEFAULT 'cod',
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `points_earned` int(11) DEFAULT 0,
  `coupon_code` varchar(50) DEFAULT NULL,
  `discount_amount` int(11) DEFAULT 0,
  `points_redeemed` int(11) DEFAULT 0,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_name`, `phone`, `address`, `total_amount`, `status`, `payment_method`, `payment_status`, `created_at`, `points_earned`, `coupon_code`, `discount_amount`, `points_redeemed`, `latitude`, `longitude`) VALUES
(1, 22, 'Uncle T', '00112233', 'Kimironko 108', 23000, 'delivered', 'cod', 'paid', '2026-07-11 16:43:07', 230, NULL, 0, 0, NULL, NULL),
(2, 22, 'Uncle T', '00112233', 'Kimironko 108', 12000, 'pending', 'cod', 'pending', '2026-07-11 17:13:33', 120, NULL, 0, 0, NULL, NULL),
(3, 1, 'Kayonga Raul', '+250788700870', 'Kimironko 108', 39000, 'delivered', 'cod', 'paid', '2026-07-11 19:03:49', 390, 'THURS_SPECIAL', 1000, 0, -1.92932400, 30.13393200),
(4, 1, 'Kayonga Raul', '+250788700870', 'Kimironko 108', 18800, 'pending', 'cod', 'pending', '2026-07-11 19:31:22', 188, NULL, 5200, 520, -1.96400100, 30.11263500);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `menu_id`, `quantity`, `price`) VALUES
(1, 1, 101, 1, 2500),
(2, 1, 103, 2, 3000),
(3, 1, 1001, 1, 2500),
(4, 1, 105, 1, 7000),
(5, 1, 102, 1, 5000),
(6, 2, 102, 1, 5000),
(7, 2, 101, 1, 2500),
(8, 2, 103, 1, 3000),
(9, 2, 9003, 1, 300),
(10, 2, 9002, 1, 500),
(11, 2, 9004, 1, 200),
(12, 2, 9001, 1, 500),
(13, 3, 102, 5, 5000),
(14, 3, 101, 6, 2500),
(15, 4, 105, 2, 7000),
(16, 4, 104, 1, 5000),
(17, 4, 101, 1, 0),
(18, 4, 102, 1, 5000);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review_text` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `menu_id`, `rating`, `review_text`, `photo`, `created_at`) VALUES
(1, 1, 101, 4, '', NULL, '2026-07-06 06:12:40'),
(2, 22, 103, 4, '', NULL, '2026-07-11 16:42:44'),
(3, 22, 102, 5, 'Sweeeet!', NULL, '2026-07-11 17:03:21');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('admin','staff','customer') DEFAULT 'customer',
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `points` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `phone`, `address`, `role`, `profile_image`, `created_at`, `is_active`, `points`) VALUES
(1, 'admin@acecafe.com', '$2y$10$Rz4YbRI3ug93ZyscQhB95OE93GS4vLAg29xy6RaY69kTqVuu0jyIu', 'Kayonga Raul', '+250788700870', 'Kimironko 108', 'admin', 'images/profiles/1783786818_creditCard.png', '2026-06-18 07:40:51', 1, 188),
(2, 'rwagacayaryan9@gmail.com', '$2y$10$kGaCis.23.Xqx.kbBeYK7OX8OyHp57rFmfoS9nHdn4MnDw/uGKL82', 'Ryan Rwagacyaya', '+250786897752', 'GIkondo - Merez', 'staff', 'images/profiles/1781802422_Sony_a7IV_3qtr.jpeg', '2026-06-18 16:57:57', 1, 0),
(3, 'client2@gmail.com', '$2y$10$Z6wSWhoFqQTx/qhxBakhsOLqmePU4r3ewA9ETTBaGYOk7Xfa9g7qG', 'Client Demo', '+100054879557', 'Kimironko 108', 'customer', 'images/user_profile_6a35791e9f1bf.png', '2026-06-19 08:39:24', 1, 0),
(4, 'kayonga_raul@gmail.com', '$2y$10$QK1N4a9T8xE9VXYyt2cayeoI2WbJ.AP1VfD64X28LBMnYZSLLJplC', 'Keirable', '+250788700870', 'Kimironko (Mushimire Massive) , Kigali Rwanda.', 'staff', 'images/user_profile_6a357934dc4b8.png', '2026-06-19 15:56:36', 1, 0),
(5, 'ramadhan@gmail.com', '$2y$10$.MVJ2O726aGvwMHpAdm0xeY22Vanl6zBL9EQdEaotIH4Rxlg5oTZy', 'Ramadhan ACE', '+100054879557', 'Remera', 'staff', 'images/profiles/1781903135_Cappuccino.png', '2026-06-19 21:01:43', 1, 0),
(6, 'ishimwejmilah098@gmail.com', '$2y$10$C7yzICDzNbLA9h8H3pXXquLvpoJcc6D7KyI4Bq607Umlf5VG/cHbm', 'Ishimwe Jamilah', '0790597491', 'Kicukiro - Niboye', 'staff', 'images/user_profile_6a36a267ac6bf.jpeg', '2026-06-20 07:14:36', 1, 0),
(8, 'gakizasolo@gmail.com', '$2y$10$Zg9R0JHhfS3HYekX0Ngo2eGJf9E3zk5aiqeSn1UCBTtTxmElC2rNC', 'Gakiza Solomon', '0790903406', 'kk 515 st', 'customer', NULL, '2026-06-20 07:43:53', 1, 0),
(9, 'client5@gmail.com', '$2y$10$hNGIdGclO1Zm9nlmCkMveOgYUqtRTrxvNQB1WQSfODt6aWiYpEg3q', 'Client Demo5', '+100054879557', 'Remera1', 'customer', 'images/profiles/1781986776_bg_.png', '2026-06-20 20:19:06', 1, 0),
(10, 'rwigemaparfait@gmail.com', '$2y$10$SS63fSrHVNom9Kvr4njLR.Vm21co8UKTC3lWA9V56Wa.MAtc8NioW', 'Perfect', '0780701841', 'KG368 St', 'staff', NULL, '2026-06-22 13:52:35', 1, 0),
(11, 'lorenzo@gmail.com', '$2y$10$r/VRPd5dL8gQKXnfN7yHLeGHNu/MBin9ldE/C2EaCbUMehqGaeKCa', 'Prince Lorenzo', '+250783579339', 'Gisozi - KG309', 'customer', NULL, '2026-06-24 10:43:20', 1, 0),
(12, 'lucas@gmail.com', '$2y$10$DA0Mg9aIdlldWKPA50tF1OXKOyP0MIQAQ3rC3OYG5XNzz2nTohcjy', 'lucavish', '07854243458', 'Giporoso', 'customer', NULL, '2026-06-24 14:10:20', 1, 0),
(16, 'testuser@example.com', '$2y$10$4pktiHGoXDWrA3L9A3NBxOovS6sijIG.3NAKQ.mMdpPFRFO.AnWo6', 'Test User', '1234567890', '123 Main St', 'customer', NULL, '2026-06-24 15:56:15', 1, 0),
(18, 'shukuru@gmail.com', '$2y$10$Vnyq7PMySh867CQ5i.N2HOcs7QbF8Ux9oNl6/upXAHwn43ijwpV9S', 'Shukuru Ya Jean', '0788343230', 'shukuruyj@gmail.com', 'customer', 'images/user_profile_6a3bff52287ce.jpeg', '2026-06-24 16:01:02', 1, 0),
(19, 'gihozoa@gmail.com', '$2y$10$XewukJxM7tVxWacaXo4HFOjhvIxwW99w2YExhG54nJ38k9Pw76rA.', 'Audrey Gihozo', NULL, NULL, 'staff', NULL, '2026-06-24 16:01:53', 1, 135),
(20, 'gasongo@gmail.com', '$2y$10$i32UCxIsSro6k.Mkw6tsv.5Ym1y732qgwUL2ruD0YawGJyexFN0h2', 'Gasongo', '1234567890', 'Gikondo', 'customer', NULL, '2026-06-24 17:37:42', 1, 125),
(21, 'imanishimwejadon3@gmail.com', '$2y$10$kIYcT9RmlZmLtJFkv1929uP.tlTlsIXZOQIeFopQts9tMglgbPM22', 'Imanishimwe Jadon', '0788657257', 'Gikondo', 'customer', 'images/user_profile_6a3e4671619ed.png', '2026-06-26 09:27:48', 1, 50),
(22, 'unclet@gmail.com', '$2y$10$wMqdnSy8yikllIvXkXOa4OqZlbC.NNnDH77/aLJMcwHadvqrEYfHC', 'Uncle T', '00112233', 'Kimironko 108', 'staff', NULL, '2026-07-04 18:00:17', 0, 425),
(23, 'barindadavid1@gmail.com', '$2y$10$URS2TPIfQ4uNGdE2k0xxpuYDPWLSP1Z.NuZlQcc6pCOvw3.c/NHqa', 'Barinda David', '0785650773', 'Kigali', 'customer', NULL, '2026-07-06 06:05:00', 1, 25);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`menu_id`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_menu` (`user_id`,`menu_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`email`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9006;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
