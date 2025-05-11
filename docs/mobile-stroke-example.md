# Mobile Stroke Input Implementation Guide

This guide demonstrates how to implement the stroke input feature in the BookNote mobile app using Flutter. The implementation allows users to draw and capture handwritten notes on mobile devices.

## 1. Stroke Data Model

First, we need to define a model to represent stroke data:

```dart
class StrokePoint {
  final double x;
  final double y;
  final double pressure;
  final double timestamp;

  StrokePoint({
    required this.x, 
    required this.y, 
    required this.pressure, 
    required this.timestamp
  });

  Map<String, dynamic> toJson() => {
    'x': x,
    'y': y,
    'pressure': pressure,
    'timestamp': timestamp,
  };

  factory StrokePoint.fromJson(Map<String, dynamic> json) => StrokePoint(
    x: json['x'],
    y: json['y'],
    pressure: json['pressure'],
    timestamp: json['timestamp'],
  );
}

class Stroke {
  final String id;
  final List<StrokePoint> points;
  final String color;
  final double width;

  Stroke({
    required this.id,
    required this.points,
    required this.color,
    required this.width,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'points': points.map((p) => p.toJson()).toList(),
    'color': color,
    'width': width,
  };

  factory Stroke.fromJson(Map<String, dynamic> json) => Stroke(
    id: json['id'],
    points: (json['points'] as List).map((p) => StrokePoint.fromJson(p)).toList(),
    color: json['color'],
    width: json['width'],
  );
}
```

## 2. Capturing Strokes with Flutter

Create a canvas widget to capture strokes:

```dart
class DrawingCanvas extends StatefulWidget {
  final Function(Stroke) onStrokeComplete;

  const DrawingCanvas({Key? key, required this.onStrokeComplete}) : super(key: key);

  @override
  State<DrawingCanvas> createState() => _DrawingCanvasState();
}

class _DrawingCanvasState extends State<DrawingCanvas> {
  List<Stroke> strokes = [];
  List<StrokePoint> currentPoints = [];
  String currentColor = '#000000';
  double currentWidth = 2.0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: _onPanStart,
      onPanUpdate: _onPanUpdate,
      onPanEnd: _onPanEnd,
      child: CustomPaint(
        painter: StrokePainter(strokes: strokes, currentPoints: currentPoints),
        size: Size.infinite,
      ),
    );
  }

  void _onPanStart(DragStartDetails details) {
    RenderBox box = context.findRenderObject() as RenderBox;
    Offset point = box.globalToLocal(details.globalPosition);
    
    setState(() {
      currentPoints = [
        StrokePoint(
          x: point.dx,
          y: point.dy,
          pressure: details.kind == PointerDeviceKind.stylus ? 
              details.sourceTimeStamp!.inMilliseconds.toDouble() : 
              1.0,
          timestamp: DateTime.now().millisecondsSinceEpoch.toDouble(),
        ),
      ];
    });
  }

  void _onPanUpdate(DragUpdateDetails details) {
    RenderBox box = context.findRenderObject() as RenderBox;
    Offset point = box.globalToLocal(details.globalPosition);
    
    setState(() {
      currentPoints.add(
        StrokePoint(
          x: point.dx,
          y: point.dy,
          pressure: details.kind == PointerDeviceKind.stylus ? 
              details.sourceTimeStamp!.inMilliseconds.toDouble() : 
              1.0,
          timestamp: DateTime.now().millisecondsSinceEpoch.toDouble(),
        ),
      );
    });
  }

  void _onPanEnd(DragEndDetails details) {
    // Create a new stroke
    if (currentPoints.isNotEmpty) {
      final newStroke = Stroke(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        points: List.from(currentPoints),
        color: currentColor,
        width: currentWidth,
      );
      
      setState(() {
        strokes.add(newStroke);
        currentPoints = [];
      });
      
      // Pass the completed stroke back to parent
      widget.onStrokeComplete(newStroke);
    }
  }
}

class StrokePainter extends CustomPainter {
  final List<Stroke> strokes;
  final List<StrokePoint> currentPoints;

  StrokePainter({required this.strokes, required this.currentPoints});

  @override
  void paint(Canvas canvas, Size size) {
    // Draw completed strokes
    for (var stroke in strokes) {
      final path = Path();
      final paint = Paint()
        ..color = _parseColor(stroke.color)
        ..strokeWidth = stroke.width
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..style = PaintingStyle.stroke;
      
      if (stroke.points.isNotEmpty) {
        path.moveTo(stroke.points.first.x, stroke.points.first.y);
        
        for (var point in stroke.points.skip(1)) {
          path.lineTo(point.x, point.y);
        }
      }
      
      canvas.drawPath(path, paint);
    }
    
    // Draw current stroke being drawn
    if (currentPoints.isNotEmpty) {
      final path = Path();
      final paint = Paint()
        ..color = _parseColor(currentColor)
        ..strokeWidth = currentWidth
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..style = PaintingStyle.stroke;
      
      path.moveTo(currentPoints.first.x, currentPoints.first.y);
      
      for (var point in currentPoints.skip(1)) {
        path.lineTo(point.x, point.y);
      }
      
      canvas.drawPath(path, paint);
    }
  }

  Color _parseColor(String hexColor) {
    hexColor = hexColor.toUpperCase().replaceAll('#', '');
    if (hexColor.length == 6) {
      hexColor = 'FF' + hexColor;
    }
    return Color(int.parse(hexColor, radix: 16));
  }

  @override
  bool shouldRepaint(covariant StrokePainter oldDelegate) {
    return oldDelegate.strokes != strokes || 
           oldDelegate.currentPoints != currentPoints;
  }
}
```

## 3. Saving Strokes to the API

Create a service to send the stroke data to the backend:

```dart
class ThoughtService {
  final Dio _dio = Dio();
  final String baseUrl = 'https://your-api.com';
  
  Future<Thought> createThoughtWithStroke({
    required String noteId,
    required Stroke stroke,
    String? parentThoughtId,
  }) async {
    try {
      // Convert stroke to JSON string
      final strokeJson = json.encode(stroke.toJson());
      
      // Create the request payload
      final payload = {
        'noteId': noteId,
        'inputType': 'STROKE',
        'strokeData': strokeJson,
        'orderIndex': 0,
        'depth': parentThoughtId != null ? 1 : 0,
        'parentThoughtId': parentThoughtId,
      };
      
      // Send the request
      final response = await _dio.post(
        '$baseUrl/thoughts',
        data: payload,
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      
      return Thought.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to create thought: ${e.toString()}');
    }
  }
  
  Future<List<Stroke>> getStrokesForThought(String thoughtId) async {
    try {
      final response = await _dio.get(
        '$baseUrl/strokes/thought/$thoughtId',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );
      
      final List<dynamic> strokesJson = response.data;
      return strokesJson.map((json) => Stroke.fromJson(json['strokeData'])).toList();
    } catch (e) {
      throw Exception('Failed to get strokes: ${e.toString()}');
    }
  }
}
```

## 4. Integrating in the Note Taking Screen

Here's how you can integrate the stroke capturing in your note-taking screen:

```dart
class NoteDetailScreen extends StatefulWidget {
  final String noteId;

  const NoteDetailScreen({Key? key, required this.noteId}) : super(key: key);

  @override
  State<NoteDetailScreen> createState() => _NoteDetailScreenState();
}

class _NoteDetailScreenState extends State<NoteDetailScreen> {
  final ThoughtService _thoughtService = ThoughtService();
  bool isDrawingMode = false;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Note Details'),
        actions: [
          IconButton(
            icon: Icon(isDrawingMode ? Icons.edit : Icons.draw),
            onPressed: () {
              setState(() {
                isDrawingMode = !isDrawingMode;
              });
            },
          ),
        ],
      ),
      body: isDrawingMode 
          ? DrawingCanvas(onStrokeComplete: _handleStrokeComplete)
          : TextNoteView(noteId: widget.noteId),
    );
  }
  
  void _handleStrokeComplete(Stroke stroke) async {
    try {
      // Save the stroke to the API
      final thought = await _thoughtService.createThoughtWithStroke(
        noteId: widget.noteId,
        stroke: stroke,
      );
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Stroke saved successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save stroke: ${e.toString()}')),
      );
    }
  }
}
```

## 5. Displaying Saved Strokes

To display the saved strokes, you need to fetch them from the API and render them on a canvas:

```dart
class StrokeViewer extends StatefulWidget {
  final String thoughtId;

  const StrokeViewer({Key? key, required this.thoughtId}) : super(key: key);

  @override
  State<StrokeViewer> createState() => _StrokeViewerState();
}

class _StrokeViewerState extends State<StrokeViewer> {
  final ThoughtService _thoughtService = ThoughtService();
  List<Stroke> strokes = [];
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadStrokes();
  }
  
  Future<void> _loadStrokes() async {
    try {
      setState(() {
        isLoading = true;
      });
      
      final fetchedStrokes = await _thoughtService.getStrokesForThought(widget.thoughtId);
      
      setState(() {
        strokes = fetchedStrokes;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load strokes: ${e.toString()}')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    return CustomPaint(
      painter: StrokePainter(strokes: strokes, currentPoints: []),
      size: Size.infinite,
    );
  }
}
```

## 6. Testing the Implementation

To test this implementation:

1. Run the Flutter app on a mobile device with a stylus (for best results)
2. Navigate to a note detail screen
3. Toggle the drawing mode
4. Draw on the canvas with your finger or stylus
5. When you lift your finger/stylus, the stroke will be saved to the backend
6. You can switch back to text mode and later reload the strokes

This implementation supports:
- Capturing stroke data including position, pressure, and timing
- Saving strokes to the backend
- Displaying saved strokes
- Toggling between text and drawing modes

The stroke data is structured to work with the backend API we created, storing the JSON-serialized stroke information in the database. 