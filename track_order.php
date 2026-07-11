<?php
require_once 'db.php';
session_start();

$orderId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($orderId <= 0) {
    header("Location: index.html");
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT o.*, u.full_name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = :id");
    $stmt->execute([':id' => $orderId]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        die("Order not found.");
    }
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Track Order #<?= $order['id'] ?> - Ace Cafe</title>
    <link href="https://fonts.googleapis.com/css2?family=Magra:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/phosphor-icons">
    <style>
        :root {
            --brand-red: #7A1C24;
            --brand-cream: #F8F5F2;
            --text-dark: #1A3B47;
            --text-muted: #8c9ea6;
            --border-color: #e1e3e5;
            --bg-card: rgba(255, 255, 255, 0.85);
            --green: #2ed573;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--brand-cream);
            color: var(--text-dark);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            box-sizing: border-box;
        }

        .tracker-container {
            width: 100%;
            max-width: 500px;
            background: var(--bg-card);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(26, 59, 71, 0.05);
        }

        header {
            text-align: center;
            margin-bottom: 30px;
        }

        header h1 {
            font-family: 'Magra', sans-serif;
            font-size: 28px;
            color: var(--brand-red);
            margin: 0;
            letter-spacing: 1px;
        }

        header p {
            color: var(--text-muted);
            font-size: 14px;
            margin: 8px 0 0;
        }

        /* Timeline Stepper */
        .timeline {
            position: relative;
            margin: 40px 0;
            padding-left: 50px;
            list-style: none;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 19px;
            top: 10px;
            bottom: 10px;
            width: 3px;
            background: var(--border-color);
            border-radius: 2px;
        }

        .timeline-item {
            position: relative;
            margin-bottom: 30px;
            opacity: 0.5;
            transition: opacity 0.5s ease;
        }

        .timeline-item.active {
            opacity: 1;
        }

        .timeline-item.completed {
            opacity: 0.85;
        }

        .timeline-icon {
            position: absolute;
            left: -50px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #fff;
            border: 3px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: var(--text-muted);
            transition: all 0.5s ease;
            box-sizing: border-box;
        }

        .timeline-item.completed .timeline-icon {
            border-color: var(--green);
            background: var(--green);
            color: white;
        }

        .timeline-item.active .timeline-icon {
            border-color: var(--brand-red);
            background: var(--brand-red);
            color: white;
            box-shadow: 0 0 0 6px rgba(122, 28, 36, 0.15);
            animation: pulse-ring 1.5s infinite;
        }

        .timeline-content {
            padding-top: 6px;
        }

        .timeline-title {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 16px;
            margin: 0 0 4px;
            color: var(--text-dark);
        }

        .timeline-desc {
            font-size: 12px;
            color: var(--text-muted);
            margin: 0;
            line-height: 1.4;
        }

        /* Receipt Card Details */
        .details-card {
            background: rgba(0, 0, 0, 0.02);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 20px;
            margin-top: 25px;
            font-size: 13px;
        }

        .details-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        .details-row:last-child {
            margin-bottom: 0;
        }

        .details-row strong {
            color: var(--text-dark);
        }

        .details-row span {
            color: var(--text-muted);
        }

        .btn-home {
            display: block;
            text-align: center;
            background: var(--brand-red);
            color: white;
            text-decoration: none;
            padding: 12px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            margin-top: 25px;
            box-shadow: 0 4px 15px rgba(122, 28, 36, 0.2);
            transition: opacity 0.2s;
        }

        .btn-home:hover {
            opacity: 0.9;
        }

        @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(122, 28, 36, 0.3); }
            70% { box-shadow: 0 0 0 10px rgba(122, 28, 36, 0); }
            100% { box-shadow: 0 0 0 0 rgba(122, 28, 36, 0); }
        }
    </style>
</head>
<body>
    <div class="tracker-container">
        <header>
            <h1>ACE CAFE</h1>
            <p>Track Order #<?= $order['id'] ?></p>
        </header>

        <ul class="timeline">
            <!-- Step 1: Placed -->
            <li class="timeline-item" id="step-pending">
                <div class="timeline-icon">
                    <i class="ph ph-receipt"></i>
                </div>
                <div class="timeline-content">
                    <h3 class="timeline-title">Order Placed</h3>
                    <p class="timeline-desc">We've received your order and are processing payment approval.</p>
                </div>
            </li>

            <!-- Step 2: Preparing -->
            <li class="timeline-item" id="step-preparing">
                <div class="timeline-icon">
                    <i class="ph ph-fire-simple"></i>
                </div>
                <div class="timeline-content">
                    <h3 class="timeline-title">In the Kitchen</h3>
                    <p class="timeline-desc">Our barista/chef is preparing your fresh order items.</p>
                </div>
            </li>

            <!-- Step 3: Out for delivery / Ready -->
            <li class="timeline-item" id="step-out_for_delivery">
                <div class="timeline-icon">
                    <i class="ph ph-moped"></i>
                </div>
                <div class="timeline-content">
                    <h3 class="timeline-title" id="title-step-3">On the Way</h3>
                    <p class="timeline-desc" id="desc-step-3">Your delivery driver has picked up your order and is heading your way.</p>
                </div>
            </li>

            <!-- Step 4: Delivered -->
            <li class="timeline-item" id="step-delivered">
                <div class="timeline-icon">
                    <i class="ph ph-sparkles"></i>
                </div>
                <div class="timeline-content">
                    <h3 class="timeline-title" id="title-step-4">Delivered</h3>
                    <p class="timeline-desc" id="desc-step-4">Order has been delivered. Thank you for dining with Ace Cafe!</p>
                </div>
            </li>
        </ul>

        <div class="details-card">
            <div class="details-row">
                <strong>Recipient:</strong>
                <span><?= htmlspecialchars($order['customer_name'] ?: $order['customer_name']) ?></span>
            </div>
            <div class="details-row">
                <strong>Phone:</strong>
                <span><?= htmlspecialchars($order['phone']) ?></span>
            </div>
            <div class="details-row">
                <strong>Delivery Address:</strong>
                <span style="max-width: 250px; text-align: right; word-wrap: break-word;"><?= htmlspecialchars($order['address']) ?></span>
            </div>
            <div class="details-row">
                <strong>Payment Method:</strong>
                <span style="text-transform: uppercase;"><?= htmlspecialchars($order['payment_method']) ?></span>
            </div>
            <div class="details-row">
                <strong>Total Amount:</strong>
                <strong style="color: var(--brand-red);">RWF <?= number_format($order['total_amount']) ?></strong>
            </div>
        </div>

        <a href="index.html" class="btn-home">Return to Storefront</a>
    </div>

    <script>
        const orderId = <?= $orderId ?>;
        
        async function updateStatus() {
            try {
                const res = await fetch(`api/order_status.php?id=${orderId}&_t=${new Date().getTime()}`);
                const data = await res.json();
                
                if (data.status === 'success') {
                    const status = data.order_status;
                    
                    // Reset all items
                    const items = document.querySelectorAll('.timeline-item');
                    items.forEach(i => i.className = 'timeline-item');
                    
                    // Setup classes based on status
                    const stepPending = document.getElementById('step-pending');
                    const stepPreparing = document.getElementById('step-preparing');
                    const stepDelivery = document.getElementById('step-out_for_delivery');
                    const stepDelivered = document.getElementById('step-delivered');

                    // Adjust descriptions for pickup orders if needed
                    const paymentMethod = "<?= $order['payment_method'] ?>";
                    const isPickup = (paymentMethod === 'pickup'); 
                    
                    if (isPickup) {
                        document.getElementById('title-step-3').innerText = "Ready for Pickup";
                        document.getElementById('desc-step-3').innerText = "Your order is ready and waiting for you at our pickup counter.";
                        document.getElementById('title-step-4').innerText = "Completed";
                        document.getElementById('desc-step-4').innerText = "You have successfully picked up your order. Enjoy!";
                    }

                    if (status === 'pending') {
                        stepPending.classList.add('active');
                    } else if (status === 'preparing') {
                        stepPending.classList.add('completed');
                        stepPreparing.classList.add('active');
                    } else if (status === 'out_for_delivery' || status === 'complete_awaiting_pickup') {
                        stepPending.classList.add('completed');
                        stepPreparing.classList.add('completed');
                        stepDelivery.classList.add('active');
                    } else if (status === 'delivered') {
                        stepPending.classList.add('completed');
                        stepPreparing.classList.add('completed');
                        stepDelivery.classList.add('completed');
                        stepDelivered.classList.add('completed');
                    } else if (status === 'cancelled') {
                        stepPending.classList.add('completed');
                        document.getElementById('title-step-4').innerText = "Cancelled";
                        document.getElementById('desc-step-4').innerText = "This order was cancelled by the store/customer.";
                        stepDelivered.classList.add('active');
                        // style it red
                        stepDelivered.querySelector('.timeline-icon').style.backgroundColor = '#ff4757';
                        stepDelivered.querySelector('.timeline-icon').style.borderColor = '#ff4757';
                    }
                }
            } catch (error) {
                console.error("Error updating order status timeline:", error);
            }
        }

        // Poll every 4 seconds
        updateStatus();
        setInterval(updateStatus, 4000);
    </script>
</body>
</html>
