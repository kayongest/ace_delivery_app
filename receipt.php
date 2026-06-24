<?php
require_once 'db.php';
session_start();

if (!isset($_GET['id'])) {
    die("Invalid Order ID.");
}

$orderId = (int)$_GET['id'];

// Fetch Order
$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = :id");
$stmt->execute([':id' => $orderId]);
$order = $stmt->fetch();

if (!$order) {
    die("Order not found.");
}

// Optional Security: If user_id is set, only allow that user OR admin to view it.
// If it's a guest order (user_id is null), anyone with the link can view it.
if ($order['user_id'] !== null) {
    $isOwner = (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $order['user_id']);
    $isAdmin = (isset($_SESSION['role']) && $_SESSION['role'] === 'admin');
    if (!$isOwner && !$isAdmin) {
        die("Unauthorized access to this receipt.");
    }
}

// Fetch Order Items
$stmtItems = $pdo->prepare("
    SELECT oi.*, m.name 
    FROM order_items oi 
    JOIN menu m ON oi.menu_id = m.id 
    WHERE oi.order_id = :id
");
$stmtItems->execute([':id' => $orderId]);
$items = $stmtItems->fetchAll();

$orderDate = date("F j, Y, g:i a", strtotime($order['created_at']));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - Order #<?= htmlspecialchars($order['id']) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Magra:wght@400;700&amp;display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    
    <style>
        body {
            background-color: #e5e5e5;
            font-family: "Magra", sans-serif; /* Monospace for thermal receipt feel */
            color: #111;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }

        .receipt-container {
            background-color: #fff;
            width: 100%;
            max-width: 350px;
            padding: 30px 20px;
            box-sizing: border-box;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            position: relative;
        }

        /* Jagged bottom edge using pseudo-element */
        .receipt-container::after {
            content: "";
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 10px;
            background-size: 20px 20px;
            background-image: radial-gradient(circle at 10px 10px, transparent 12px, #fff 13px);
            background-repeat: repeat-x;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header img {
            width: 60px;
            margin-bottom: 10px;
            /* grayscale filter for thermal look */
            filter: grayscale(100%) contrast(1.2); 
        }

        .header h1 {
            font-family: "Magra", sans-serif;
            font-size: 24px;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .header p {
            margin: 0;
            font-size: 12px;
            color: #555;
        }

        .divider {
            border-top: 1px dashed #111;
            margin: 15px 0;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 5px;
        }

        .items-table {
            width: 100%;
            font-size: 13px;
            border-collapse: collapse;
        }

        .items-table th {
            text-align: left;
            border-bottom: 1px dashed #111;
            padding-bottom: 5px;
            font-weight: bold;
        }

        .items-table th.qty { width: 15%; }
        .items-table th.item { width: 55%; }
        .items-table th.price { width: 30%; text-align: right; }

        .items-table td {
            padding: 8px 0;
            vertical-align: top;
        }
        
        .items-table td.price {
            text-align: right;
        }

        .totals {
            margin-top: 15px;
            font-size: 14px;
        }

        .totals .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }

        .totals .grand-total {
            font-weight: bold;
            font-size: 16px;
            margin-top: 10px;
            border-top: 1px dashed #111;
            padding-top: 10px;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
        }

        .status-badge {
            display: inline-block;
            border: 1px solid #111;
            padding: 3px 8px;
            border-radius: 12px;
            text-transform: uppercase;
            font-size: 10px;
            margin-bottom: 10px;
        }

        /* Action Buttons (Hidden when printing) */
        .actions {
            text-align: center;
            margin-top: 30px;
        }
        .btn {
            background: #111;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 4px;
            font-size: 14px;
            margin: 0 5px;
            text-decoration: none;
        }
        .btn-outline {
            background: transparent;
            color: #111;
            border: 1px solid #111;
        }

        @media print {
            body {
                background-color: #fff;
                padding: 0;
            }
            .receipt-container {
                box-shadow: none;
                max-width: 100%;
            }
            .receipt-container::after {
                display: none;
            }
            .actions {
                display: none;
            }
        }
    </style>
</head>
<body>

    <div class="receipt-container">
        
        <div class="header">
            <!-- Using the Ace Cafe Logo, grayscaled in CSS -->
            <img src="images/ace_cafe_logo_circle.png" alt="Ace Cafe Logo">
            <h1>Ace Cafe</h1>
            <p>123 Coffee Avenue, Kigali</p>
            <p>Tel: +250 123 456 789</p>
        </div>

        <div class="divider"></div>

        <div class="info-row">
            <span>Order No:</span>
            <span>#<?= str_pad($order['id'], 5, '0', STR_PAD_LEFT) ?></span>
        </div>
        <div class="info-row">
            <span>Date:</span>
            <span><?= $orderDate ?></span>
        </div>
        <div class="info-row">
            <span>Customer:</span>
            <span><?= htmlspecialchars($order['customer_name']) ?></span>
        </div>
        <div class="info-row">
            <span>Phone:</span>
            <span><?= htmlspecialchars($order['phone']) ?></span>
        </div>
        
        <div class="divider"></div>
        


        <table class="items-table">
            <thead>
                <tr>
                    <th class="qty">Qty</th>
                    <th class="item">Item</th>
                    <th class="price">Amount</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach($items as $item): ?>
                <tr>
                    <td><?= $item['quantity'] ?></td>
                    <td><?= htmlspecialchars($item['name']) ?></td>
                    <td class="price"><?= number_format($item['price'] * $item['quantity']) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <div class="totals">
            <div class="row grand-total">
                <span>TOTAL (RWF)</span>
                <span><?= number_format($order['total_amount']) ?></span>
            </div>
            <div class="row">
                <span>Payment Method</span>
                <span style="text-transform: uppercase; font-weight: bold;"><?= str_replace('_', ' ', htmlspecialchars($order['payment_method'] ?? 'COD')) ?></span>
            </div>
        </div>

        <div class="divider"></div>

        <div class="footer">
            <p>Thank you for choosing Ace Cafe!</p>
            <p style="font-size: 10px; margin-top: 5px;">Powered by AceCafe OS</p>
        </div>

        <div class="actions">
            <button class="btn" onclick="window.print()">Print</button>
            <button class="btn" style="background: #1A3B47;" onclick="downloadPDF()">Download PDF</button>
            <button class="btn btn-outline" onclick="window.close(); if(!window.closed) window.location.href='./';">Close</button>
        </div>

    </div>

    <script>
        function downloadPDF() {
            const element = document.querySelector('.receipt-container');
            const actions = document.querySelector('.actions');
            
            // Temporarily hide actions for PDF
            actions.style.display = 'none';
            
            const opt = {
                margin:       10,
                filename:     'AceCafe_Receipt_<?= $order['id'] ?>.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: [80, 200], orientation: 'portrait' } // thermal receipt size approx
            };

            html2pdf().set(opt).from(element).save().then(() => {
                actions.style.display = 'flex';
            });
        }
    </script>

</body>
</html>
